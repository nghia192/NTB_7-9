using Newtonsoft.Json;
using NtbSoft.ERP.Entity.SYSTEM;
using NtbSoft.ERP.Model.ThuVien;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    // ================================================================
    // GHI CHÚ: File này KHÔNG có thay đổi liên quan tới 2 lỗi đã sửa
    // (PK_SYS_ResourceOrder và kéo-thả bảng Quản lý ngôn ngữ) — cả hai
    // đều nằm ở phía Stored Procedure (SP_SYS_LanguageResource) và
    // JavaScript (sys-language-fixed.js). File Controller này được giữ
    // nguyên logic để bộ 3 file đi kèm nhau đầy đủ, dễ deploy chung.
    // ================================================================
    [RoutePrefix("api/SYS_Language")]
    public class SYS_LanguageController : ApiController
    {
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para1 = "", string para2 = "", string para3 = "")
        {
            return new SYS_LanguageModel().Get(action, para1, para2, para3);
        }

        [HttpPost]
        [Route("SaveResourceOrder")]
        public string SaveResourceOrder([FromBody] List<string> orderedResourceKeys)
        {
            try
            {
                if (orderedResourceKeys == null || orderedResourceKeys.Count == 0) return "False";
                var tbl = new DataTable();
                tbl.Columns.Add("ResourceKey", typeof(string));
                tbl.Columns.Add("OrderIndex", typeof(int));
                for (int i = 0; i < orderedResourceKeys.Count; i++)
                {
                    var row = tbl.NewRow();
                    row["ResourceKey"] = orderedResourceKeys[i] ?? "";
                    row["OrderIndex"] = i + 1;
                    tbl.Rows.Add(row);
                }

                return new SYS_LanguageModel().SaveResourceOrder(tbl);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        [HttpGet]
        [Route("GetByLanguage")]
        public DataTable GetByLanguage(string languageID)
        {
            return new SYS_LanguageModel().Get("GET_BY_LANG", languageID);
        }

        [HttpGet]
        [Route("GetByKey")]
        public DataTable GetByKey(string resourceKey)
        {
            return new SYS_LanguageModel().Get("SEARCH", resourceKey, "", "");
        }

        [HttpGet]
        [Route("GetLanguages")]
        public DataTable GetLanguages()
        {
            return new SYS_LanguageModel().Get("GET_LANGUAGES");
        }

        [HttpPost]
        [Route("SaveLanguage")]
        public object SaveLanguage(string langCode, string langName, string nativeName, string flagIcon = "", bool allowOverwrite = false)
        {
            var dt = new SYS_LanguageModel().SaveLanguage(langCode ?? "", langName ?? "", nativeName ?? "", flagIcon, allowOverwrite);
            return BuildResult(dt);
        }

        [HttpPost]
        [Route("SaveOrder")]
        public string SaveOrder([FromBody] List<string> orderedLangCodes)
        {
            try
            {
                if (orderedLangCodes == null || orderedLangCodes.Count == 0) return "False";
                // Build DataTable for TVP: LangCode, OrderIndex
                var tbl = new DataTable();
                tbl.Columns.Add("LangCode", typeof(string));
                tbl.Columns.Add("OrderIndex", typeof(int));
                for (int i = 0; i < orderedLangCodes.Count; i++)
                {
                    var row = tbl.NewRow();
                    row["LangCode"] = orderedLangCodes[i] ?? "";
                    row["OrderIndex"] = i + 1;
                    tbl.Rows.Add(row);
                }

                return new SYS_LanguageModel().SaveOrder(tbl);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        [HttpPost]
        [Route("DeleteLanguage")]
        public object DeleteLanguage(string langCode)
        {
            DataTable dt = new SYS_LanguageModel().Get("DELETE_LANG", langCode ?? "");
            return BuildResult(dt);
        }

        [HttpPost]
        [Route("Save")]
        public object Save(List<LanguageResourceItem> lstSave, bool allowOverwrite = false)
        {
            string json = JsonConvert.SerializeObject(lstSave);
            DataTable rawTbl = JsonConvert.DeserializeObject<DataTable>(json);

            // ============================================================
            // QUAN TRỌNG: Table-Valued Parameter (TVP) trong ADO.NET ánh xạ
            // cột theo VỊ TRÍ (ordinal), KHÔNG theo tên cột. DataTable deserialize
            // từ JSON có thứ tự cột phụ thuộc vào thứ tự field trong object JS gửi
            // lên (ResourceKey, LanguageID, Value, Description, IsHtml, UpdatedBy),
            // sau đó "Module" bị thêm vào CUỐI CÙNG nếu thiếu.
            // Thứ tự này KHÔNG khớp với SYS_LanguageResourceType:
            //     ResourceKey, LanguageID, Value, Module, Description, IsHtml, UpdatedBy
            // => Trước đây dữ liệu bị lệch cột (VD: UpdatedBy kiểu string rơi vào
            //    cột IsHtml kiểu BIT), gây lỗi convert bị CATCH trong SP và trả về
            //    Result = 'False' dù người dùng tưởng là đã lưu thành công.
            // Hàm dưới đây build lại DataTable ĐÚNG THỨ TỰ CỘT theo TVP để đảm bảo
            // ánh xạ chính xác, bất kể JS gửi field theo thứ tự nào.
            // ============================================================
            DataTable tbl = ReorderColumnsForResourceTvp(rawTbl);

            var model = new SYS_LanguageModel();
            var dt = model.PostDataTable("SAVE", "@TypeTable", tbl, allowOverwrite);
            return BuildResult(dt);
        }

        [HttpPost]
        [Route("CheckResourceExists")]
        public DataTable CheckResourceExists(List<LanguageResourceItem> lst)
        {
            string json = JsonConvert.SerializeObject(lst);
            DataTable rawTbl = JsonConvert.DeserializeObject<DataTable>(json);
            DataTable tbl = ReorderColumnsForResourceTvp(rawTbl);
            return new SYS_LanguageModel().PostDataTable("CHECK_RESOURCE_EXISTS", "@TypeTable", tbl);
        }

        [HttpPost]
        [Route("Delete")]
        public object Delete(string resourceKey, string languageID)
        {
            DataTable dt = new SYS_LanguageModel().Get("DELETE", resourceKey, languageID);
            return BuildResult(dt);
        }

        // ================================================================
        // Helper: sắp xếp lại DataTable đúng thứ tự cột mà TVP
        // SYS_LanguageResourceType yêu cầu, tự điền giá trị mặc định cho
        // cột bị thiếu (VD: JS không gửi Module) thay vì để lệch vị trí.
        // ================================================================
        private static DataTable ReorderColumnsForResourceTvp(DataTable source)
        {
            var result = new DataTable();
            result.Columns.Add("ResourceKey", typeof(string));
            result.Columns.Add("LanguageID", typeof(string));
            result.Columns.Add("Value", typeof(string));
            result.Columns.Add("Module", typeof(string));
            result.Columns.Add("Description", typeof(string));
            result.Columns.Add("IsHtml", typeof(bool));
            result.Columns.Add("UpdatedBy", typeof(string));

            if (source == null) return result;

            foreach (DataRow srcRow in source.Rows)
            {
                var newRow = result.NewRow();
                foreach (DataColumn destCol in result.Columns)
                {
                    if (source.Columns.Contains(destCol.ColumnName) && srcRow[destCol.ColumnName] != DBNull.Value)
                    {
                        try
                        {
                            newRow[destCol.ColumnName] = Convert.ChangeType(srcRow[destCol.ColumnName], destCol.DataType);
                        }
                        catch
                        {
                            newRow[destCol.ColumnName] = DBNull.Value;
                        }
                    }
                    else
                    {
                        // IsHtml mặc định false, các cột string mặc định NULL/rỗng
                        newRow[destCol.ColumnName] = destCol.DataType == typeof(bool) ? (object)false : DBNull.Value;
                    }
                }
                result.Rows.Add(newRow);
            }
            return result;
        }

        // ================================================================
        // Helper: trả về đầy đủ cả Result và Message (thay vì chỉ lấy cột
        // đầu tiên và vứt bỏ Message như code cũ), để frontend hiển thị
        // đúng lý do khi lưu/xóa thất bại thay vì luôn hiện thông báo
        // chung chung.
        // ================================================================
        private static object BuildResult(DataTable dt)
        {
            if (dt != null && dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                return new
                {
                    Result = row[0]?.ToString() ?? "False",
                    Message = dt.Columns.Contains("Message") && row["Message"] != DBNull.Value
                        ? row["Message"].ToString()
                        : ""
                };
            }
            return new { Result = "False", Message = "Không có dữ liệu trả về từ server." };
        }
    }
}