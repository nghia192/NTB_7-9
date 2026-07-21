USE QMS_SPECTRE;
GO

-- Ensure SP_SYS_LanguageResource exists and has basic behavior (non-destructive)
-- This uses CREATE OR ALTER so it will create if missing or replace existing.
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

	IF @Action = 'GET_ALL'
	BEGIN
		SELECT r.*, l.LanguageName, l.NativeName
		FROM SYS_LanguageResource r
		JOIN SYS_Language l ON r.LanguageID = l.LanguageID
		LEFT JOIN SYS_ResourceOrder ro ON ro.ResourceKey = r.ResourceKey
		ORDER BY COALESCE(ro.SortOrder, 0), r.Module, r.ResourceKey;
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
					SELECT 'EXISTS' AS Result, N'Exists' AS Message; RETURN;
				END
			END

			MERGE SYS_LanguageResource AS target
			USING @TypeTable AS source
			ON (target.ResourceKey = source.ResourceKey AND target.LanguageID = source.LanguageID)
			WHEN MATCHED THEN
				UPDATE SET
					Value = source.Value,
					Module = ISNULL(source.Module, target.Module),
					Description = ISNULL(source.Description, target.Description),
					IsHtml = ISNULL(source.IsHtml, target.IsHtml),
					UpdatedDate = GETDATE(),
					UpdatedBy = source.UpdatedBy
			WHEN NOT MATCHED THEN
				INSERT (ResourceKey, LanguageID, Value, Module, Description, IsHtml, UpdatedBy)
				VALUES (source.ResourceKey, source.LanguageID, source.Value, source.Module, source.Description, source.IsHtml, source.UpdatedBy);

			SELECT 'True' AS Result, '' AS Message;
		END TRY
		BEGIN CATCH
			SELECT 'False' AS Result, ERROR_MESSAGE() AS Message;
		END CATCH
		RETURN;
	END

	-- Fallback: return empty set to avoid exceptions
	SELECT '' AS Result, '' AS Message WHERE 1 = 0;
END
GO
