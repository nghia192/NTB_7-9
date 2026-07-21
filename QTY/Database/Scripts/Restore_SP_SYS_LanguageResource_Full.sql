USE QMS_SPECTRE;
GO

-- Restore full SP_SYS_LanguageResource with duplicate checks and ordering support
-- This script recreates the stored procedure with the expected actions:
-- GET_ALL, GET_BY_LANG, GET_BY_MODULE, GET_LANGUAGES, SEARCH,
-- CHECK_RESOURCE_EXISTS, CHECK_LANG_EXISTS, SAVE (with @AllowOverwrite),
-- DELETE, DELETE_BY_KEY, SAVE_LANG, DELETE_LANG

CREATE OR ALTER PROCEDURE SP_SYS_LanguageResource
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
	-- READ / LIST
	----------------------------------------------------------------
	IF @Action = 'GET_ALL'
	BEGIN
		SELECT r.*, l.LanguageName, l.NativeName
		FROM SYS_LanguageResource r
		JOIN SYS_Language l ON r.LanguageID = l.LanguageID
		LEFT JOIN SYS_ResourceOrder ro ON ro.ResourceKey = r.ResourceKey
		ORDER BY COALESCE(ro.SortOrder, 0), r.Module, r.ResourceKey;
		RETURN;
	END

	ELSE IF @Action = 'GET_BY_LANG'
	BEGIN
		SELECT ResourceKey, Value, Module, IsHtml
		FROM SYS_LanguageResource r
		LEFT JOIN SYS_ResourceOrder ro ON ro.ResourceKey = r.ResourceKey
		WHERE r.LanguageID = @para1
		ORDER BY COALESCE(ro.SortOrder, 0), r.Module, r.ResourceKey;
		RETURN;
	END

	ELSE IF @Action = 'GET_BY_MODULE'
	BEGIN
		SELECT ResourceKey, Value, Module, IsHtml
		FROM SYS_LanguageResource r
		LEFT JOIN SYS_ResourceOrder ro ON ro.ResourceKey = r.ResourceKey
		WHERE r.LanguageID = @para1 AND r.Module = @para2
		ORDER BY COALESCE(ro.SortOrder, 0), r.ResourceKey;
		RETURN;
	END

	ELSE IF @Action = 'GET_LANGUAGES'
	BEGIN
		SELECT LanguageID, LanguageName, NativeName, IsDefault, IsActive, SortOrder
		FROM SYS_Language
		WHERE IsActive = 1
		ORDER BY SortOrder;
		RETURN;
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
		ORDER BY COALESCE(ro.SortOrder, 0), r.Module, r.ResourceKey;
		RETURN;
	END

	----------------------------------------------------------------
	-- CHECK EXISTENCE (for duplicate detection)
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
			ON r.ResourceKey = t.ResourceKey AND r.LanguageID = t.LanguageID;
		RETURN;
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
			) THEN 1 ELSE 0 END AS ExistsByNativeName;
		RETURN;
	END

	----------------------------------------------------------------
	-- SAVE RESOURCES (with optional overwrite)
	----------------------------------------------------------------
	ELSE IF @Action = 'SAVE'
	BEGIN
		BEGIN TRY
			-- If not allowing overwrite, detect existing rows and return them
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
						ON r.ResourceKey = t.ResourceKey AND r.LanguageID = t.LanguageID;
					RETURN;
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

			SELECT 'True' AS Result, '' AS Message;
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
		END CATCH;
		RETURN;
	END

	----------------------------------------------------------------
	-- DELETE
	----------------------------------------------------------------
	ELSE IF @Action = 'DELETE'
	BEGIN
		BEGIN TRY
			DELETE FROM SYS_LanguageResource
			WHERE ResourceKey = @para1 AND LanguageID = @para2;
			SELECT 'True' AS Result, '' AS Message;
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
		END CATCH;
		RETURN;
	END

	ELSE IF @Action = 'DELETE_BY_KEY'
	BEGIN
		BEGIN TRY
			DELETE FROM SYS_LanguageResource
			WHERE ResourceKey = @para1;
			SELECT 'True' AS Result, '' AS Message;
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
		END CATCH;
		RETURN;
	END

	----------------------------------------------------------------
	-- LANGUAGE CRUD
	----------------------------------------------------------------
	ELSE IF @Action = 'SAVE_LANG'
	BEGIN
		BEGIN TRY
			DECLARE @IsNewLang BIT = CASE WHEN EXISTS (SELECT 1 FROM SYS_Language WHERE LanguageID = @para1) THEN 0 ELSE 1 END;

			IF @AllowOverwrite = 0
			BEGIN
				IF @IsNewLang = 0
				BEGIN
					SELECT 'EXISTS' AS Result, N'LanguageID "' + @para1 + N'" đã tồn tại. Bạn có muốn ghi đè?' AS Message; RETURN;
				END

				IF EXISTS (SELECT 1 FROM SYS_Language WHERE LanguageName = @para2)
				BEGIN
					SELECT 'EXISTS' AS Result, N'LanguageName "' + @para2 + N'" đã tồn tại.' AS Message; RETURN;
				END

				IF @para3 <> '' AND EXISTS (SELECT 1 FROM SYS_Language WHERE NativeName = @para3)
				BEGIN
					SELECT 'EXISTS' AS Result, N'NativeName "' + @para3 + N'" đã tồn tại.' AS Message; RETURN;
				END
			END
			ELSE
			BEGIN
				IF EXISTS (SELECT 1 FROM SYS_Language WHERE LanguageName = @para2 AND LanguageID <> @para1)
				BEGIN
					SELECT 'False' AS Result, N'LanguageName "' + @para2 + N'" đã được dùng bởi ngôn ngữ khác.' AS Message; RETURN;
				END
				IF @para3 <> '' AND EXISTS (SELECT 1 FROM SYS_Language WHERE NativeName = @para3 AND LanguageID <> @para1)
				BEGIN
					SELECT 'False' AS Result, N'NativeName "' + @para3 + N'" đã được dùng bởi ngôn ngữ khác.' AS Message; RETURN;
				END
			END

			IF @IsNewLang = 0
				UPDATE SYS_Language SET LanguageName = @para2, NativeName = @para3, IsActive = 1 WHERE LanguageID = @para1
			ELSE
				INSERT INTO SYS_Language (LanguageID, LanguageName, NativeName) VALUES (@para1, @para2, @para3);

			SELECT 'True' AS Result, '' AS Message;
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
		END CATCH;
		RETURN;
	END

	ELSE IF @Action = 'DELETE_LANG'
	BEGIN
		BEGIN TRY
			DELETE FROM SYS_LanguageResource WHERE LanguageID = @para1;
			DELETE FROM SYS_Language WHERE LanguageID = @para1;
			SELECT 'True' AS Result, '' AS Message;
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
		END CATCH;
		RETURN;
	END

	-- Default: return empty set
	SELECT '' AS Result, '' AS Message WHERE 1 = 0;
END
GO
