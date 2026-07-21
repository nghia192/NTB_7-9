-- ================================================================
-- 1. BẢNG DM_CaLamViec (khai báo ca)
-- ================================================================
IF OBJECT_ID('dbo.DM_CaLamViec', 'U') IS NOT NULL DROP TABLE dbo.DM_CaLamViec;
GO
CREATE TABLE dbo.DM_CaLamViec (
    CaLV        INT NOT NULL,
    TGBatDau    TIME(0) NOT NULL,
    TGKetThuc   TIME(0) NULL,
    CONSTRAINT PK_DM_CaLamViec PRIMARY KEY (CaLV)
);
GO

-- ================================================================
-- 2. HÀM ĐỊNH DẠNG GIỜ KIỂU "H:MM" (không số 0 ở đầu giờ)
-- ================================================================
CREATE OR ALTER FUNCTION dbo.FN_CaLamViec_FormatGio (@t TIME(0))
RETURNS VARCHAR(5)
AS
BEGIN
    RETURN CAST(DATEPART(HOUR, @t) AS VARCHAR(2)) + ':' +
           RIGHT('0' + CAST(DATEPART(MINUTE, @t) AS VARCHAR(2)), 2);
END
GO

-- ================================================================
-- 3. USER-DEFINED TABLE TYPE (Bổ sung SortOrder)
-- ================================================================
IF TYPE_ID('dbo.CaLamViecChiTietType') IS NOT NULL DROP TYPE dbo.CaLamViecChiTietType;
GO
CREATE TYPE dbo.CaLamViecChiTietType AS TABLE (
    TimeShiftID  VARCHAR(3)    NOT NULL,
    Name         NVARCHAR(50)  NOT NULL,
    TimeLine     TIME(7)       NULL,
    Descriptions NVARCHAR(50)  NULL,
    Minutes      INT           NOT NULL,
    SortOrder    INT           NOT NULL,
    PRIMARY KEY (TimeShiftID)
);
GO

-- ================================================================
-- 4. TẠO CA TỰ ĐỘNG
-- ================================================================
CREATE OR ALTER PROCEDURE dbo.SP_CaLamViec_TaoCaTuDong
    @CaLV              INT,
    @TGBatDau          TIME(0),
    @TGKetThuc         TIME(0)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SoPhutMoiKhoang INT = 0;

    IF @TGKetThuc IS NULL OR @TGKetThuc <= @TGBatDau
    BEGIN
        SELECT 'INVALID' AS Result, N'Giờ kết thúc phải sau giờ bắt đầu.' AS Message;
        RETURN;
    END

    DECLARE @TableName SYSNAME = N'TimeShift_Ca' + CAST(@CaLV AS NVARCHAR(10));
    DECLARE @sql NVARCHAR(MAX);

    BEGIN TRY
        BEGIN TRAN;

        IF NOT EXISTS (SELECT 1 FROM dbo.DM_CaLamViec WHERE CaLV = @CaLV)
            INSERT INTO dbo.DM_CaLamViec (CaLV, TGBatDau, TGKetThuc) VALUES (@CaLV, @TGBatDau, @TGKetThuc);
        ELSE
            UPDATE dbo.DM_CaLamViec SET TGBatDau = @TGBatDau, TGKetThuc = @TGKetThuc WHERE CaLV = @CaLV;

        IF OBJECT_ID('dbo.' + @TableName, 'U') IS NULL
        BEGIN
            -- Thêm cột SortOrder vào cấu trúc bảng
            SET @sql = N'
            CREATE TABLE dbo.' + QUOTENAME(@TableName) + N' (
                TimeShiftID  VARCHAR(3)    NOT NULL,
                Name         NVARCHAR(50)  NOT NULL,
                TimeLine     TIME(7)       NULL,
                Descriptions NVARCHAR(50)  NULL,
                Minutes      INT           NOT NULL,
                SortOrder    INT           NOT NULL DEFAULT 0,
                CONSTRAINT PK_' + @TableName + N' PRIMARY KEY (TimeShiftID)
            );';
            EXEC sp_executesql @sql;
        END

        SET @sql = N'TRUNCATE TABLE dbo.' + QUOTENAME(@TableName) + N';';
        EXEC sp_executesql @sql;

        DECLARE @FirstEnd TIME(0) = CAST(DATEADD(MINUTE, @SoPhutMoiKhoang, CAST(@TGBatDau AS DATETIME)) AS TIME(0));
        IF @FirstEnd > @TGKetThuc SET @FirstEnd = @TGKetThuc;

        DECLARE @FirstName NVARCHAR(50) = dbo.FN_CaLamViec_FormatGio(@TGBatDau) + '-' + dbo.FN_CaLamViec_FormatGio(@FirstEnd);
        DECLARE @FirstMinutes INT = DATEDIFF(MINUTE, @TGBatDau, @FirstEnd);

        -- Thêm SortOrder = 1 cho dòng đầu tiên
        SET @sql = N'INSERT INTO dbo.' + QUOTENAME(@TableName) + N' (TimeShiftID, Name, TimeLine, Descriptions, Minutes, SortOrder)
                     VALUES (''001'', @p_Name, @p_End, @p_Name, @p_Minutes, 1);';
        EXEC sp_executesql @sql,
            N'@p_Name NVARCHAR(50), @p_End TIME(7), @p_Minutes INT',
            @p_Name = @FirstName, @p_End = @FirstEnd, @p_Minutes = @FirstMinutes;

        COMMIT TRAN;

        -- Order by theo SortOrder thay vì TimeLine
        SET @sql = N'SELECT * FROM dbo.' + QUOTENAME(@TableName) + N' ORDER BY SortOrder ASC, TimeLine ASC';
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO

-- ================================================================
-- 5. SỬA TÊN KHOẢNG (Đã xóa bỏ ràng buộc cascade nối đuôi nhau)
-- ================================================================
CREATE OR ALTER PROCEDURE dbo.SP_CaLamViec_SuaTenKhoang
    @CaLV          INT,
    @TimeShiftID   VARCHAR(3),
    @NewName       NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TableName SYSNAME = N'TimeShift_Ca' + CAST(@CaLV AS NVARCHAR(10));
    IF OBJECT_ID('dbo.' + @TableName, 'U') IS NULL
    BEGIN
        SELECT 'NOT_FOUND' AS Result, N'Không tìm thấy bảng chi tiết của ca này.' AS Message;
        RETURN;
    END

    DECLARE @DashPos INT = CHARINDEX('-', @NewName);
    IF @DashPos = 0
    BEGIN
        SELECT 'INVALID' AS Result, N'Name phải có dạng "H:MM-H:MM"' AS Message;
        RETURN;
    END

    DECLARE @NewStart TIME(0) = TRY_CAST(LEFT(@NewName, @DashPos - 1) AS TIME(0));
    DECLARE @NewEnd   TIME(0) = TRY_CAST(SUBSTRING(@NewName, @DashPos + 1, 50) AS TIME(0));

    IF @NewStart IS NULL OR @NewEnd IS NULL OR @NewEnd <= @NewStart
    BEGIN
        SELECT 'INVALID' AS Result, N'Giờ không hợp lệ (Bắt đầu phải nhỏ hơn Kết thúc).' AS Message;
        RETURN;
    END

    DECLARE @CaStart TIME(0);
    SELECT @CaStart = TGBatDau FROM dbo.DM_CaLamViec WHERE CaLV = @CaLV;
    IF @CaStart IS NULL
    BEGIN
        SELECT 'NOT_FOUND' AS Result, N'Không tìm thấy ca.' AS Message;
        RETURN;
    END

    IF OBJECT_ID('tempdb..#Rows2') IS NOT NULL DROP TABLE #Rows2;

    BEGIN TRY
        DECLARE @sql NVARCHAR(MAX);
        DECLARE @NewMinutes INT = DATEDIFF(MINUTE, @NewStart, @NewEnd);

        -- Bước 1: cập nhật Minutes cho dòng đang sửa (dựa trên khoảng giờ mới)
        SET @sql = N'UPDATE dbo.' + QUOTENAME(@TableName) + N'
                     SET Minutes = @p_Minutes WHERE TimeShiftID = @p_ID;';
        EXEC sp_executesql @sql, N'@p_Minutes INT, @p_ID VARCHAR(3)',
            @p_Minutes = @NewMinutes, @p_ID = @TimeShiftID;

        -- Bước 2: đọc toàn bộ danh sách (đã có Minutes mới) ra bảng tạm
        CREATE TABLE #Rows2 (TimeShiftID VARCHAR(3), Minutes INT, SortOrder INT);

        SET @sql = N'INSERT INTO #Rows2 (TimeShiftID, Minutes, SortOrder)
                     SELECT TimeShiftID, Minutes, SortOrder FROM dbo.' + QUOTENAME(@TableName) + N';';
        EXEC sp_executesql @sql;

        -- Bước 3: tính lại Start/End cho từng dòng theo thứ tự SortOrder
        DECLARE @Calc TABLE (TimeShiftID VARCHAR(3), EndTime TIME(0), NewName NVARCHAR(50));

        INSERT INTO @Calc (TimeShiftID, EndTime, NewName)
        SELECT
            r.TimeShiftID,
            CAST(DATEADD(MINUTE, r.PrevSum + r.Minutes, CAST(@CaStart AS DATETIME)) AS TIME(0)),
            dbo.FN_CaLamViec_FormatGio(CAST(DATEADD(MINUTE, r.PrevSum, CAST(@CaStart AS DATETIME)) AS TIME(0)))
              + '-' +
            dbo.FN_CaLamViec_FormatGio(CAST(DATEADD(MINUTE, r.PrevSum + r.Minutes, CAST(@CaStart AS DATETIME)) AS TIME(0)))
        FROM (
            SELECT TimeShiftID, Minutes, SortOrder,
                   ISNULL(SUM(Minutes) OVER (ORDER BY SortOrder ASC
                        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS PrevSum
            FROM #Rows2
        ) r;

        -- Bước 4: ghi lại Name/Descriptions/TimeLine cho từng dòng
        DECLARE @TSID VARCHAR(3), @NName NVARCHAR(50), @EndT TIME(0);
        DECLARE cur2 CURSOR LOCAL FAST_FORWARD FOR SELECT TimeShiftID, NewName, EndTime FROM @Calc;
        OPEN cur2;
        FETCH NEXT FROM cur2 INTO @TSID, @NName, @EndT;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @sql = N'UPDATE dbo.' + QUOTENAME(@TableName) + N'
                         SET Name = @p_Name, Descriptions = @p_Name, TimeLine = @p_End
                         WHERE TimeShiftID = @p_ID;';
            EXEC sp_executesql @sql,
                N'@p_Name NVARCHAR(50), @p_End TIME(0), @p_ID VARCHAR(3)',
                @p_Name = @NName, @p_End = @EndT, @p_ID = @TSID;
            FETCH NEXT FROM cur2 INTO @TSID, @NName, @EndT;
        END
        CLOSE cur2; DEALLOCATE cur2;

        DROP TABLE #Rows2;

        -- Tự động kéo dài TGKetThuc nếu khoảng cuối cùng vượt quá giờ kết thúc hiện tại
        EXEC dbo.SP_CaLamViec_MoRongTGKetThuc @CaLV = @CaLV, @TableName = @TableName;

        SET @sql = N'SELECT TimeShiftID, Name, Descriptions, TimeLine, Minutes, SortOrder
                      FROM dbo.' + QUOTENAME(@TableName) + N'
                      ORDER BY SortOrder ASC, TimeLine ASC;';
        EXEC sp_executesql @sql;

        -- Result set thứ 2: thông tin ca đã cập nhật
        SELECT CaLV, TGBatDau, TGKetThuc FROM dbo.DM_CaLamViec WHERE CaLV = @CaLV;
    END TRY
    BEGIN CATCH
        IF OBJECT_ID('tempdb..#Rows2') IS NOT NULL DROP TABLE #Rows2;
        IF CURSOR_STATUS('local','cur2') >= 0 BEGIN CLOSE cur2; DEALLOCATE cur2; END
        SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO
-- ================================================================
-- 6. TẠO MỚI: API Sắp xếp lại thứ tự bằng JSON Array
-- ================================================================
CREATE OR ALTER PROCEDURE dbo.SP_CaLamViec_LuuThuTuKhoang
    @CaLV       INT,
    @OrderJson  NVARCHAR(MAX) -- Nhận mảng string ID VD: '["003", "001", "002"]'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TableName SYSNAME = N'TimeShift_Ca' + CAST(@CaLV AS NVARCHAR(10));
    IF OBJECT_ID('dbo.' + @TableName, 'U') IS NULL
    BEGIN
        SELECT 'NOT_FOUND' AS Result, N'Không tìm thấy bảng chi tiết của ca này.' AS Message;
        RETURN;
    END

    BEGIN TRY
        -- OPENJSON sẽ tách mảng, lấy giá trị và Index tự động [key] (0, 1, 2...)
        DECLARE @sql NVARCHAR(MAX) = N'
        WITH OrderCTE AS (
            SELECT [value] AS TimeShiftID, CAST([key] AS INT) + 1 AS RN
            FROM OPENJSON(@p_Json)
        )
        UPDATE t
        SET t.SortOrder = c.RN
        FROM dbo.' + QUOTENAME(@TableName) + N' t
        INNER JOIN OrderCTE c ON t.TimeShiftID = c.TimeShiftID;
        
        SELECT * FROM dbo.' + QUOTENAME(@TableName) + N' ORDER BY SortOrder ASC, TimeLine ASC;';
        
        EXEC sp_executesql @sql, N'@p_Json NVARCHAR(MAX)', @p_Json = @OrderJson;
    END TRY
    BEGIN CATCH
        SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_CaLamViec_SuaMinutes
    @CaLV        INT,
    @TimeShiftID VARCHAR(3),
    @NewMinutes  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @NewMinutes IS NULL OR @NewMinutes <= 0
    BEGIN
        SELECT 'INVALID' AS Result, N'Số phút phải lớn hơn 0.' AS Message;
        RETURN;
    END

    DECLARE @TableName SYSNAME = N'TimeShift_Ca' + CAST(@CaLV AS NVARCHAR(10));
    IF OBJECT_ID('dbo.' + @TableName, 'U') IS NULL
    BEGIN
        SELECT 'NOT_FOUND' AS Result, N'Không tìm thấy bảng chi tiết của ca này.' AS Message;
        RETURN;
    END

    DECLARE @CaStart TIME(0);
    SELECT @CaStart = TGBatDau FROM dbo.DM_CaLamViec WHERE CaLV = @CaLV;
    IF @CaStart IS NULL
    BEGIN
        SELECT 'NOT_FOUND' AS Result, N'Không tìm thấy ca.' AS Message;
        RETURN;
    END

    IF OBJECT_ID('tempdb..#Rows') IS NOT NULL DROP TABLE #Rows;

    BEGIN TRY
        DECLARE @sql NVARCHAR(MAX);

        -- Bước 1: cập nhật Minutes cho dòng đang sửa
        SET @sql = N'UPDATE dbo.' + QUOTENAME(@TableName) + N'
                     SET Minutes = @p_Minutes WHERE TimeShiftID = @p_ID;';
        EXEC sp_executesql @sql, N'@p_Minutes INT, @p_ID VARCHAR(3)',
            @p_Minutes = @NewMinutes, @p_ID = @TimeShiftID;

        -- Bước 2: đọc toàn bộ danh sách (đã có Minutes mới) ra bảng tạm
        CREATE TABLE #Rows (TimeShiftID VARCHAR(3), Minutes INT, SortOrder INT);

        SET @sql = N'INSERT INTO #Rows (TimeShiftID, Minutes, SortOrder)
                     SELECT TimeShiftID, Minutes, SortOrder FROM dbo.' + QUOTENAME(@TableName) + N';';
        EXEC sp_executesql @sql;

        -- Bước 3: tính lại Start/End cho từng dòng bằng T-SQL tĩnh (không escape lồng)
        DECLARE @Calc TABLE (TimeShiftID VARCHAR(3), EndTime TIME(0), NewName NVARCHAR(50));

        INSERT INTO @Calc (TimeShiftID, EndTime, NewName)
        SELECT
            r.TimeShiftID,
            CAST(DATEADD(MINUTE, r.PrevSum + r.Minutes, CAST(@CaStart AS DATETIME)) AS TIME(0)),
            dbo.FN_CaLamViec_FormatGio(CAST(DATEADD(MINUTE, r.PrevSum, CAST(@CaStart AS DATETIME)) AS TIME(0)))
              + '-' +
            dbo.FN_CaLamViec_FormatGio(CAST(DATEADD(MINUTE, r.PrevSum + r.Minutes, CAST(@CaStart AS DATETIME)) AS TIME(0)))
        FROM (
            SELECT TimeShiftID, Minutes, SortOrder,
                   ISNULL(SUM(Minutes) OVER (ORDER BY SortOrder ASC
                        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS PrevSum
            FROM #Rows
        ) r;

        -- Bước 4: ghi lại Name/Descriptions/TimeLine cho từng dòng
        DECLARE @TSID VARCHAR(3), @NewName NVARCHAR(50), @EndT TIME(0);
        DECLARE cur CURSOR LOCAL FAST_FORWARD FOR SELECT TimeShiftID, NewName, EndTime FROM @Calc;
        OPEN cur;
        FETCH NEXT FROM cur INTO @TSID, @NewName, @EndT;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @sql = N'UPDATE dbo.' + QUOTENAME(@TableName) + N'
                         SET Name = @p_Name, Descriptions = @p_Name, TimeLine = @p_End
                         WHERE TimeShiftID = @p_ID;';
            EXEC sp_executesql @sql,
                N'@p_Name NVARCHAR(50), @p_End TIME(0), @p_ID VARCHAR(3)',
                @p_Name = @NewName, @p_End = @EndT, @p_ID = @TSID;
            FETCH NEXT FROM cur INTO @TSID, @NewName, @EndT;
        END
        CLOSE cur; DEALLOCATE cur;

        DROP TABLE #Rows;

-- Tự động kéo dài TGKetThuc nếu khoảng mới vượt quá giờ kết thúc hiện tại
EXEC dbo.SP_CaLamViec_MoRongTGKetThuc @CaLV = @CaLV, @TableName = @TableName;

SET @sql = N'SELECT TimeShiftID, Name, Descriptions, TimeLine, Minutes, SortOrder
              FROM dbo.' + QUOTENAME(@TableName) + N'
              ORDER BY SortOrder ASC, TimeLine ASC;';
EXEC sp_executesql @sql;

-- Result set thứ 2: thông tin ca đã cập nhật
SELECT CaLV, TGBatDau, TGKetThuc FROM dbo.DM_CaLamViec WHERE CaLV = @CaLV;


        SET @sql = N'SELECT TimeShiftID, Name, Descriptions, TimeLine, Minutes, SortOrder
                      FROM dbo.' + QUOTENAME(@TableName) + N'
                      ORDER BY SortOrder ASC, TimeLine ASC;';
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        IF OBJECT_ID('tempdb..#Rows') IS NOT NULL DROP TABLE #Rows;
        IF CURSOR_STATUS('local','cur') >= 0 BEGIN CLOSE cur; DEALLOCATE cur; END
        SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_CaLamViec_MoRongTGKetThuc
    @CaLV      INT,
    @TableName SYSNAME
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaxEnd TIME(0);
    DECLARE @sql NVARCHAR(MAX) = N'SELECT @p_MaxEnd = MAX(TimeLine) FROM dbo.' + QUOTENAME(@TableName) + N';';
    EXEC sp_executesql @sql, N'@p_MaxEnd TIME(0) OUTPUT', @p_MaxEnd = @MaxEnd OUTPUT;

    IF @MaxEnd IS NULL RETURN;

    -- Giới hạn tối đa 23:59 để không tràn qua ngày hôm sau
    DECLARE @Capped TIME(0) = CASE WHEN @MaxEnd > '23:59:00' THEN '23:59:00' ELSE @MaxEnd END;

    UPDATE dbo.DM_CaLamViec
    SET TGKetThuc = @Capped
    WHERE CaLV = @CaLV AND (TGKetThuc IS NULL OR @Capped > TGKetThuc);
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_CaLamViec_SuaGioCa
    @CaLV      INT,
    @TGBatDau  TIME(0),
    @TGKetThuc TIME(0)
AS
BEGIN
    SET NOCOUNT ON;

    IF @TGKetThuc IS NULL OR @TGKetThuc <= @TGBatDau
    BEGIN
        SELECT 'INVALID' AS Result, N'Giờ kết thúc phải sau giờ bắt đầu.' AS Message;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.DM_CaLamViec WHERE CaLV = @CaLV)
    BEGIN
        SELECT 'NOT_FOUND' AS Result, N'Không tìm thấy ca.' AS Message;
        RETURN;
    END

    DECLARE @TableName SYSNAME = N'TimeShift_Ca' + CAST(@CaLV AS NVARCHAR(10));

    BEGIN TRY
        -- Chỉ update giờ ca, KHÔNG đụng tới bảng chi tiết
        UPDATE dbo.DM_CaLamViec
        SET TGBatDau = @TGBatDau, TGKetThuc = @TGKetThuc
        WHERE CaLV = @CaLV;

        DECLARE @sql NVARCHAR(MAX);
        IF OBJECT_ID('dbo.' + @TableName, 'U') IS NOT NULL
        BEGIN
            SET @sql = N'SELECT TimeShiftID, Name, Descriptions, TimeLine, Minutes, SortOrder
                          FROM dbo.' + QUOTENAME(@TableName) + N'
                          ORDER BY SortOrder ASC, TimeLine ASC;';
            EXEC sp_executesql @sql;
        END
        ELSE
        BEGIN
            SELECT CAST(NULL AS VARCHAR(3)) AS TimeShiftID, CAST(NULL AS NVARCHAR(50)) AS Name,
                   CAST(NULL AS NVARCHAR(50)) AS Descriptions, CAST(NULL AS TIME(7)) AS TimeLine,
                   CAST(NULL AS INT) AS Minutes, CAST(NULL AS INT) AS SortOrder WHERE 1=0;
        END

        -- Result set thứ 2: thông tin ca đã cập nhật
        SELECT CaLV, TGBatDau, TGKetThuc FROM dbo.DM_CaLamViec WHERE CaLV = @CaLV;
    END TRY
    BEGIN CATCH
        SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO