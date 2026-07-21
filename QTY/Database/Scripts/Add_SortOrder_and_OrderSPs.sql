USE QMS_SPECTRE;
GO

IF OBJECT_ID('SP_SYS_LanguageResource', 'P') IS NOT NULL
	DROP PROCEDURE SP_SYS_LanguageResource;
GO

CREATE PROCEDURE SP_SYS_LanguageResource
	@Action         NVARCHAR(50),
	@para1          NVARCHAR(500) = '',
	@para2          NVARCHAR(500) = '',
	@para3          NVARCHAR(500) = '',
	@AllowOverwrite BIT           = 0,
	@TypeTable      SYS_LanguageResourceType READONLY
AS
BEGIN
	SET NOCOUNT ON;

	----------------------------------------------------------------
	-- TRUY VẤN (GET)
	----------------------------------------------------------------
	IF @Action = 'GET_ALL'
	BEGIN
		SELECT r.*, l.LanguageName, l.NativeName
		FROM SYS_LanguageResource r
		JOIN SYS_Language l ON r.LanguageID = l.LanguageID
		LEFT JOIN SYS_ResourceOrder ro ON ro.ResourceKey = r.ResourceKey
		ORDER BY COALESCE(ro.SortOrder, 0), r.Module, r.ResourceKey
	END
	ELSE IF @Action = 'GET_BY_LANG'
	BEGIN
		SELECT r.ResourceKey, r.Value, r.Module, r.IsHtml
		FROM SYS_LanguageResource r
		LEFT JOIN SYS_ResourceOrder ro ON ro.ResourceKey = r.ResourceKey
		WHERE r.LanguageID = @para1
		ORDER BY COALESCE(ro.SortOrder, 0), r.Module, r.ResourceKey
	END
	ELSE IF @Action = 'GET_BY_MODULE'
	BEGIN
		SELECT ResourceKey, Value, Module, IsHtml
		FROM SYS_LanguageResource r
		LEFT JOIN SYS_ResourceOrder ro ON ro.ResourceKey = r.ResourceKey
		WHERE r.LanguageID = @para1 AND r.Module = @para2
		ORDER BY COALESCE(ro.SortOrder, 0), r.ResourceKey
	END
	ELSE IF @Action = 'GET_LANGUAGES'
	BEGIN
		SELECT LanguageID, LanguageName, NativeName, IsDefault, IsActive, SortOrder
		FROM SYS_Language
		WHERE IsActive = 1
		ORDER BY SortOrder
	END
	ELSE IF @Action = 'SEARCH'
	BEGIN
		SELECT r.*, l.LanguageName, l.NativeName
		FROM SYS_LanguageResource r
		JOIN SYS_Language l ON r.LanguageID = l.LanguageID
		LEFT JOIN SYS_ResourceOrder ro ON ro.ResourceKey = r.ResourceKey
		WHERE (@para1 = '' OR r.ResourceKey LIKE '%' + @para1 + '%')
		  AND (@para2 = '' OR r.Module = @para2)
		  AND (@para3 = '' OR r.LanguageID = @para3)
		ORDER BY COALESCE(ro.SortOrder, 0), r.Module, r.ResourceKey
	END

	----------------------------------------------------------------
	-- Existing check/CRUD actions remain unchanged below
	----------------------------------------------------------------
	ELSE IF @Action = 'CHECK_RESOURCE_EXISTS'
	BEGIN
		SELECT
			t.ResourceKey,
			t.LanguageID,
			r.Value AS CurrentValue,
			1 AS IsExists
		FROM @TypeTable t
		JOIN SYS_LanguageResource r
			ON r.ResourceKey = t.ResourceKey AND r.LanguageID = t.LanguageID
	END

	ELSE IF @Action = 'CHECK_LANG_EXISTS'
	BEGIN
		SELECT
			CASE WHEN EXISTS (
				SELECT 1 FROM SYS_Language WHERE LanguageID = @para1
			) THEN 1 ELSE 0 END AS ExistsByID,
			CASE WHEN EXISTS (
				SELECT 1 FROM SYS_Language
				WHERE LanguageName = @para2 AND LanguageID <> @para1
			) THEN 1 ELSE 0 END AS ExistsByName,
			CASE WHEN EXISTS (
				SELECT 1 FROM SYS_Language
				WHERE NativeName = @para3 AND LanguageID <> @para1 AND @para3 <> ''
			) THEN 1 ELSE 0 END AS ExistsByNativeName
	END

	ELSE IF @Action = 'SAVE'
	BEGIN
		BEGIN TRY
			IF @AllowOverwrite = 0
			BEGIN
				IF EXISTS (
					SELECT 1
					FROM @TypeTable t
					JOIN SYS_LanguageResource r
						ON r.ResourceKey = t.ResourceKey AND r.LanguageID = t.LanguageID
				)
				BEGIN
					SELECT
						'EXISTS' AS Result,
						N'Một hoặc nhiều ResourceKey đã tồn tại. Bạn có muốn ghi đè?' AS Message,
						t.ResourceKey, t.LanguageID
					FROM @TypeTable t
					JOIN SYS_LanguageResource r
						ON r.ResourceKey = t.ResourceKey AND r.LanguageID = t.LanguageID
					RETURN
				END
			END

			MERGE SYS_LanguageResource AS target
			USING @TypeTable AS source
			ON (target.ResourceKey = source.ResourceKey AND target.LanguageID = source.LanguageID)
			WHEN MATCHED THEN
				UPDATE SET
					Value       = source.Value,
					Module      = ISNULL(source.Module, target.Module),
					Description = ISNULL(source.Description, target.Description),
					IsHtml      = ISNULL(source.IsHtml, target.IsHtml),
					UpdatedDate = GETDATE(),
					UpdatedBy   = source.UpdatedBy
			WHEN NOT MATCHED THEN
				INSERT (ResourceKey, LanguageID, Value, Module, Description, IsHtml, UpdatedBy)
				VALUES (source.ResourceKey, source.LanguageID, source.Value,
						source.Module, source.Description, source.IsHtml, source.UpdatedBy);

			SELECT 'True' AS Result, '' AS Message
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message
		END CATCH
	END

	ELSE IF @Action = 'DELETE'
	BEGIN
		BEGIN TRY
			DELETE FROM SYS_LanguageResource
			WHERE ResourceKey = @para1 AND LanguageID = @para2;
			SELECT 'True' AS Result, '' AS Message
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message
		END CATCH
	END
	ELSE IF @Action = 'DELETE_BY_KEY'
	BEGIN
		BEGIN TRY
			DELETE FROM SYS_LanguageResource
			WHERE ResourceKey = @para1;
			SELECT 'True' AS Result, '' AS Message
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message
		END CATCH
	END

	ELSE IF @Action = 'SAVE_LANG'
	BEGIN
		BEGIN TRY
			DECLARE @IsNewLang BIT = CASE
				WHEN EXISTS (SELECT 1 FROM SYS_Language WHERE LanguageID = @para1)
				THEN 0 ELSE 1 END;

			IF @AllowOverwrite = 0
			BEGIN
				IF @IsNewLang = 0
				BEGIN
					SELECT 'EXISTS' AS Result,
						   N'LanguageID "' + @para1 + N'" đã tồn tại. Bạn có muốn ghi đè?' AS Message
					RETURN
				END

				IF EXISTS (SELECT 1 FROM SYS_Language WHERE LanguageName = @para2)
				BEGIN
					SELECT 'EXISTS' AS Result,
						   N'LanguageName "' + @para2 + N'" đã tồn tại.' AS Message
					RETURN
				END

				IF @para3 <> '' AND EXISTS (SELECT 1 FROM SYS_Language WHERE NativeName = @para3)
				BEGIN
					SELECT 'EXISTS' AS Result,
						   N'NativeName "' + @para3 + N'" đã tồn tại.' AS Message
					RETURN
				END
			END
			ELSE
			BEGIN
				IF EXISTS (SELECT 1 FROM SYS_Language WHERE LanguageName = @para2 AND LanguageID <> @para1)
				BEGIN
					SELECT 'False' AS Result,
						   N'LanguageName "' + @para2 + N'" đã được dùng bởi ngôn ngữ khác.' AS Message
					RETURN
				END
				IF @para3 <> '' AND EXISTS (SELECT 1 FROM SYS_Language WHERE NativeName = @para3 AND LanguageID <> @para1)
				BEGIN
					SELECT 'False' AS Result,
						   N'NativeName "' + @para3 + N'" đã được dùng bởi ngôn ngữ khác.' AS Message
					RETURN
				END
			END

			IF @IsNewLang = 0
				UPDATE SYS_Language
				SET LanguageName = @para2, NativeName = @para3, IsActive = 1
				WHERE LanguageID = @para1
			ELSE
				INSERT INTO SYS_Language (LanguageID, LanguageName, NativeName)
				VALUES (@para1, @para2, @para3)

			SELECT 'True' AS Result, '' AS Message
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message
		END CATCH
	END
	ELSE IF @Action = 'DELETE_LANG'
	BEGIN
		BEGIN TRY
			DELETE FROM SYS_LanguageResource WHERE LanguageID = @para1;
			DELETE FROM SYS_Language WHERE LanguageID = @para1;
			SELECT 'True' AS Result, '' AS Message
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message
		END CATCH
	END
END
GO

-- ================================================================
-- Populate initial SortOrder values for languages and resources
-- Languages: if SortOrder is NULL or 0, assign sequential numbers based on existing SortOrder then LanguageID
-- Resources: populate SYS_ResourceOrder with distinct ResourceKey ordered by Module, ResourceKey
-- ================================================================

PRINT 'Populating initial SortOrder for SYS_Language and SYS_ResourceOrder...';
GO

-- 1) Languages: ensure every language has a SortOrder (>0).
;WITH L AS (
	SELECT LanguageID,
		   ROW_NUMBER() OVER (ORDER BY CASE WHEN SortOrder > 0 THEN SortOrder ELSE 2147483647 END, LanguageID) AS NewOrder
	FROM SYS_Language
)
UPDATE l
SET SortOrder = L.NewOrder
FROM SYS_Language l
JOIN L ON l.LanguageID = L.LanguageID
WHERE l.SortOrder IS NULL OR l.SortOrder = 0;
GO

-- 2) Resources: populate SYS_ResourceOrder for all existing resource keys
MERGE dbo.SYS_ResourceOrder AS target
USING (
	SELECT ResourceKey,
		   ROW_NUMBER() OVER (ORDER BY ISNULL(r.Module, ''), r.ResourceKey) AS RN
	FROM (SELECT DISTINCT ResourceKey, Module FROM dbo.SYS_LanguageResource) r
) AS src (ResourceKey, RN)
ON (target.ResourceKey = src.ResourceKey)
WHEN MATCHED THEN
	UPDATE SET SortOrder = src.RN
WHEN NOT MATCHED BY TARGET THEN
	INSERT (ResourceKey, SortOrder) VALUES (src.ResourceKey, src.RN);
GO

-- Optional: create index on SYS_ResourceOrder.SortOrder for faster ordering
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SYS_ResourceOrder_SortOrder' AND object_id = OBJECT_ID('dbo.SYS_ResourceOrder'))
	CREATE INDEX IX_SYS_ResourceOrder_SortOrder ON dbo.SYS_ResourceOrder (SortOrder);
GO

PRINT 'Initial population completed.';
GO

