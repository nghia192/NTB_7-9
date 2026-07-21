using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Web.Mvc;
using NtbSoft.ERP.Libs;
using NtbSoft.ERP.Entity.SYSTEM;
using Newtonsoft.Json;

namespace NtbSoft.ERP.Web.Controllers
{
    public class DKCaController : Controller
    {
        private const string DetailSelect = "TimeShiftID, Name, Descriptions, TimeLine, Minutes";

        public ActionResult Index()
        {
            return View();
        }

        private static T DeserializeBody<T>(T req) where T : class
        {
            if (req != null) return req;
            var http = System.Web.HttpContext.Current;
            if (http == null || http.Request.InputStream == null) return null;
            http.Request.InputStream.Seek(0, SeekOrigin.Begin);
            using (var sr = new StreamReader(http.Request.InputStream))
            {
                var body = sr.ReadToEnd();
                if (string.IsNullOrWhiteSpace(body)) return null;
                return JsonConvert.DeserializeObject<T>(body);
            }
        }

        private static ShiftDetailModel MapDetailRow(DataRow r)
        {
            var item = new ShiftDetailModel
            {
                TimeShiftID = r.Field<string>("TimeShiftID"),
                Name = r.Field<string>("Name"),
                Minutes = r.Field<int>("Minutes")
            };
            if (r.Table.Columns.Contains("Descriptions") && r["Descriptions"] != DBNull.Value)
                item.Descriptions = r.Field<string>("Descriptions");
            else
                item.Descriptions = item.Name;
            var tl = r["TimeLine"];
            if (tl != DBNull.Value)
                item.TimeLine = ((TimeSpan)tl).ToString(@"hh\:mm\:ss");
            return item;
        }

        private static List<ShiftDetailModel> MapDetailTable(DataTable dt)
        {
            var list = new List<ShiftDetailModel>();
            if (dt == null || !dt.Columns.Contains("TimeShiftID")) return list;
            foreach (DataRow r in dt.Rows)
                list.Add(MapDetailRow(r));
            return list;
        }

        private static string CheckResultError(DataTable dt)
        {
            if (dt == null || !dt.Columns.Contains("Result")) return null;
            var resultVal = dt.Rows[0]["Result"].ToString();
            if (resultVal == "INVALID" || resultVal == "False" || resultVal == "EXISTS" ||
                resultVal == "NOT_FOUND" || resultVal == "DUPLICATE")
                return dt.Rows[0]["Message"].ToString();
            return null;
        }

        private static List<ShiftModel> LoadAllShifts(System.Data.SqlClient.SqlConnection conn)
        {
            var list = new List<ShiftModel>();
            var ds = SqlHelper.ExecuteDataset(conn, CommandType.Text,
                "SELECT CaLV, TGBatDau, TGKetThuc FROM dbo.DM_CaLamViec ORDER BY CaLV");
            if (ds == null || ds.Tables.Count == 0) return list;
            foreach (DataRow r in ds.Tables[0].Rows)
            {
                var s = new ShiftModel { CaLV = r.Field<int>("CaLV") };
                var tb = r["TGBatDau"]; var te = r["TGKetThuc"];
                if (tb != DBNull.Value) s.TGBatDau = ((TimeSpan)tb).ToString(@"hh\:mm");
                if (te != DBNull.Value) s.TGKetThuc = ((TimeSpan)te).ToString(@"hh\:mm");
                list.Add(s);
            }
            return list;
        }

        private static List<ShiftDetailModel> LoadShiftDetailsFromTable(System.Data.SqlClient.SqlConnection conn, int caLV)
        {
            var tableName = "TimeShift_Ca" + caLV;
            // Thay đổi ORDER BY TimeLine thành ORDER BY SortOrder ASC, TimeLine ASC
            var sql = $"SELECT {DetailSelect} FROM dbo.{tableName} ORDER BY SortOrder ASC, TimeLine ASC";
            var ds = SqlHelper.ExecuteDataset(conn, CommandType.Text, sql);
            if (ds == null || ds.Tables.Count == 0) return new List<ShiftDetailModel>();
            return MapDetailTable(ds.Tables[0]);
        }

        [HttpPost]
        public JsonResult DeleteShift(CreateShiftRequest req)
        {
            try
            {
                req = DeserializeBody(req);
                using (var conn = SqlHelper.GetConnection())
                {
                    var tableName = "TimeShift_Ca" + req.CaLV;
                    var sql = $@"DELETE FROM dbo.DM_CaLamViec WHERE CaLV = {req.CaLV};
                        IF OBJECT_ID('dbo.{tableName}', 'U') IS NOT NULL DROP TABLE dbo.{tableName};
                        SELECT CaLV, TGBatDau, TGKetThuc FROM dbo.DM_CaLamViec ORDER BY CaLV;";
                    var ds = SqlHelper.ExecuteDataset(conn, CommandType.Text, sql);
                    var shiftsList = new List<ShiftModel>();
                    if (ds != null && ds.Tables.Count > 0)
                    {
                        foreach (DataRow r in ds.Tables[0].Rows)
                        {
                            var s = new ShiftModel { CaLV = r.Field<int>("CaLV") };
                            var tb = r["TGBatDau"]; var te = r["TGKetThuc"];
                            if (tb != DBNull.Value) s.TGBatDau = ((TimeSpan)tb).ToString(@"hh\:mm");
                            if (te != DBNull.Value) s.TGKetThuc = ((TimeSpan)te).ToString(@"hh\:mm");
                            shiftsList.Add(s);
                        }
                    }
                    return Json(new { success = true, shifts = shiftsList });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult UpdateShiftTime(CreateShiftRequest req)
        {
            try
            {
                req = DeserializeBody(req);
                using (var conn = SqlHelper.GetConnection())
                {
                    // Chỉ cập nhật giờ ca, KHÔNG xóa/render lại các khoảng chi tiết
                    var ds = SqlHelper.ExecuteDataset(conn, "SP_CaLamViec_SuaGioCa", req.CaLV, req.TGBatDau, req.TGKetThuc);
                    var detailsList = new List<ShiftDetailModel>();
                    ShiftModel shift = null;

                    if (ds != null && ds.Tables.Count > 0)
                    {
                        var dt = ds.Tables[0];
                        var err = CheckResultError(dt);
                        if (err != null) return Json(new { success = false, error = err });
                        detailsList = MapDetailTable(dt);

                        if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                            shift = MapShiftRow(ds.Tables[1].Rows[0]);
                    }

                    return Json(new { success = true, details = detailsList, shift = shift });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult AddShiftDetail(AddShiftDetailRequest req)
        {
            try
            {
                req = DeserializeBody(req);
                if (req.Minutes < 0)
                    req.Minutes = 0; // mặc định 0 phút — người dùng tự nhập sau khi thêm

                using (var conn = SqlHelper.GetConnection())
                {
                    var tableName = "TimeShift_Ca" + req.CaLV;
                    var minutes = req.Minutes;

                    var sql = $@"
        DECLARE @CaStart TIME(0),
            @LastEnd TIME(7),
            @NewStart TIME(0),
            @NewEnd TIME(0);

        SELECT @CaStart = TGBatDau
        FROM dbo.DM_CaLamViec
        WHERE CaLV = {req.CaLV};
        IF @CaStart IS NULL BEGIN SELECT 'NOT_FOUND' AS Result, N'Không tìm thấy ca.' AS Message; RETURN; END

        SELECT TOP 1 @LastEnd = TimeLine FROM dbo.{tableName} ORDER BY TimeLine DESC;
        SET @NewStart = ISNULL(CAST(@LastEnd AS TIME(0)), @CaStart);

        IF @NewStart >= '23:59:00'
        BEGIN
            SELECT 'INVALID' AS Result, N'Ca đã đạt giới hạn 23:59, không thể thêm khoảng mới.' AS Message;
            RETURN;
        END

        SET @NewEnd = CAST(DATEADD(MINUTE, {minutes}, CAST(@NewStart AS DATETIME)) AS TIME(0));
        IF @NewEnd < @NewStart SET @NewEnd = '23:59:00';

        DECLARE @NewID VARCHAR(3);
        SELECT @NewID = RIGHT('000' + CAST(ISNULL(MAX(CAST(TimeShiftID AS INT)), 0) + 1 AS VARCHAR(3)), 3)
        FROM dbo.{tableName};

        DECLARE @NewSort INT;
        SELECT @NewSort = ISNULL(MAX(SortOrder), 0) + 1 FROM dbo.{tableName};

        DECLARE @ActualMinutes INT = DATEDIFF(MINUTE, @NewStart, @NewEnd);

        INSERT INTO dbo.{tableName} (TimeShiftID, Name, TimeLine, Descriptions, Minutes, SortOrder)
        VALUES (
            @NewID,
            CAST(DATEPART(HOUR, @NewStart) AS VARCHAR(2)) + ':' + RIGHT('0' + CAST(DATEPART(MINUTE, @NewStart) AS VARCHAR(2)), 2)
            + '-' +
            CAST(DATEPART(HOUR, @NewEnd) AS VARCHAR(2)) + ':' + RIGHT('0' + CAST(DATEPART(MINUTE, @NewEnd) AS VARCHAR(2)), 2),
            @NewEnd,
            CAST(DATEPART(HOUR, @NewStart) AS VARCHAR(2)) + ':' + RIGHT('0' + CAST(DATEPART(MINUTE, @NewStart) AS VARCHAR(2)), 2)
            + '-' +
            CAST(DATEPART(HOUR, @NewEnd) AS VARCHAR(2)) + ':' + RIGHT('0' + CAST(DATEPART(MINUTE, @NewEnd) AS VARCHAR(2)), 2),
            @ActualMinutes,
            @NewSort
        );

        SELECT {DetailSelect} FROM dbo.{tableName} ORDER BY SortOrder ASC, TimeLine ASC;";

                    var ds = SqlHelper.ExecuteDataset(conn, CommandType.Text, sql);
                    if (ds != null && ds.Tables.Count > 0)
                    {
                        var dt = ds.Tables[0];
                        var err = CheckResultError(dt);
                        if (err != null) return Json(new { success = false, error = err });

                        using (var conn2 = SqlHelper.GetConnection())
                        {
                            SqlHelper.ExecuteDataset(conn2, "SP_CaLamViec_MoRongTGKetThuc", req.CaLV, tableName);
                            var shiftDs = SqlHelper.ExecuteDataset(conn2, CommandType.Text,
                                $"SELECT CaLV, TGBatDau, TGKetThuc FROM dbo.DM_CaLamViec WHERE CaLV = {req.CaLV}");
                            ShiftModel shift = (shiftDs != null && shiftDs.Tables.Count > 0 && shiftDs.Tables[0].Rows.Count > 0)
                                ? MapShiftRow(shiftDs.Tables[0].Rows[0]) : null;

                            return Json(new { success = true, details = MapDetailTable(dt), shift = shift });
                        }
                    }
                    return Json(new { success = false, error = "Không thể thêm khoảng." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult DeleteShiftDetail(DeleteShiftDetailRequest req)
        {
            try
            {
                req = DeserializeBody(req);
                using (var conn = SqlHelper.GetConnection())
                {
                    var tableName = "TimeShift_Ca" + req.caLV;
                    var id = req.timeShiftID.Replace("'", "''");
                    var sql = $@"
                DELETE FROM dbo.{tableName} WHERE TimeShiftID = '{id}';
                ;WITH Numbered AS (
                    SELECT TimeShiftID, ROW_NUMBER() OVER (ORDER BY SortOrder ASC, TimeLine ASC) AS RN
                    FROM dbo.{tableName}
                )
                UPDATE t
                SET t.TimeShiftID = RIGHT('000' + CAST(n.RN AS VARCHAR(3)), 3)
                FROM dbo.{tableName} t
                JOIN Numbered n ON n.TimeShiftID = t.TimeShiftID;
                SELECT {DetailSelect} FROM dbo.{tableName} ORDER BY SortOrder ASC, TimeLine ASC;";

                    var ds = SqlHelper.ExecuteDataset(conn, CommandType.Text, sql);
                    if (ds != null && ds.Tables.Count > 0)
                        return Json(new { success = true, details = MapDetailTable(ds.Tables[0]) });
                    return Json(new { success = true, details = new List<ShiftDetailModel>() });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        public JsonResult GetShifts()
        {
            try
            {
                using (var conn = SqlHelper.GetConnection())
                    return Json(LoadAllShifts(conn), JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetShiftDetails(int caLV)
        {
            try
            {
                using (var conn = SqlHelper.GetConnection())
                    return Json(LoadShiftDetailsFromTable(conn, caLV), JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                return Json(new List<ShiftDetailModel>(), JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult CreateShift(CreateShiftRequest req)
        {
            try
            {
                req = DeserializeBody(req);
                using (var conn = SqlHelper.GetConnection())
                {
                    var ds = SqlHelper.ExecuteDataset(conn, "SP_CaLamViec_TaoCaTuDong", req.CaLV, req.TGBatDau, req.TGKetThuc);
                    var details = new List<ShiftDetailModel>();
                    if (ds != null && ds.Tables.Count > 0)
                    {
                        var dt = ds.Tables[0];
                        var err = CheckResultError(dt);
                        if (err != null) return Json(new { success = false, error = err });
                        details = MapDetailTable(dt);
                    }
                    return Json(new { success = true, details = details });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }
        public class UpdateOrderRequest
        {
            public int CaLV { get; set; }
            public List<string> OrderIDs { get; set; }
        }

        [HttpPost]
        public JsonResult UpdateShiftOrder(UpdateOrderRequest req)
        {
            try
            {
                req = DeserializeBody(req);
                if (req.OrderIDs == null || req.OrderIDs.Count == 0)
                    return Json(new { success = true });

                // Parse list sang chuẩn mảng JSON string
                var orderJson = Newtonsoft.Json.JsonConvert.SerializeObject(req.OrderIDs);

                using (var conn = SqlHelper.GetConnection())
                {
                    var ds = SqlHelper.ExecuteDataset(conn, "SP_CaLamViec_LuuThuTuKhoang", req.CaLV, orderJson);
                    if (ds != null && ds.Tables.Count > 0)
                    {
                        var dt = ds.Tables[0];
                        var err = CheckResultError(dt);
                        if (err != null) return Json(new { success = false, error = err });
                        return Json(new { success = true, details = MapDetailTable(dt) });
                    }
                    return Json(new { success = true });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        // =========================================================
        // ĐẢM BẢO ĐOẠN CODE NÀY NẰM TRONG CLASS DKCaController
        // =========================================================
        public class UpdateShiftNameRequest
        {
            public int CaLV { get; set; }
            public string TimeShiftID { get; set; }
            public string NewName { get; set; }
        }

        private static ShiftModel MapShiftRow(DataRow r)
        {
            var s = new ShiftModel { CaLV = r.Field<int>("CaLV") };
            var tb = r["TGBatDau"]; var te = r["TGKetThuc"];
            if (tb != DBNull.Value) s.TGBatDau = ((TimeSpan)tb).ToString(@"hh\:mm");
            if (te != DBNull.Value) s.TGKetThuc = ((TimeSpan)te).ToString(@"hh\:mm");
            return s;
        }

        [HttpPost]
        public JsonResult UpdateShiftName(UpdateShiftNameRequest req)
        {
            try
            {
                req = DeserializeBody(req);
                using (var conn = SqlHelper.GetConnection())
                {
                    var ds = SqlHelper.ExecuteDataset(conn, "SP_CaLamViec_SuaTenKhoang", req.CaLV, req.TimeShiftID, req.NewName);
                    if (ds != null && ds.Tables.Count > 0)
                    {
                        var dt = ds.Tables[0];
                        var err = CheckResultError(dt);
                        if (err != null) return Json(new { success = false, error = err });

                        ShiftModel shift = (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                            ? MapShiftRow(ds.Tables[1].Rows[0]) : null;

                        return Json(new { success = true, details = MapDetailTable(dt), shift = shift });
                    }
                    return Json(new { success = true, details = new List<ShiftDetailModel>() });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        
        public class UpdateMinutesRequest
        {
            public int CaLV { get; set; }
            public string TimeShiftID { get; set; }
            public int Minutes { get; set; }
        }

        [HttpPost]
        public JsonResult UpdateShiftMinutes(UpdateMinutesRequest req)
        {
            try
            {
                req = DeserializeBody(req);
                using (var conn = SqlHelper.GetConnection())
                {
                    var ds = SqlHelper.ExecuteDataset(conn, "SP_CaLamViec_SuaMinutes", req.CaLV, req.TimeShiftID, req.Minutes);
                    if (ds != null && ds.Tables.Count > 0)
                    {
                        var dt = ds.Tables[0];
                        var err = CheckResultError(dt);
                        if (err != null) return Json(new { success = false, error = err });

                        ShiftModel shift = (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                            ? MapShiftRow(ds.Tables[1].Rows[0]) : null;

                        return Json(new { success = true, details = MapDetailTable(dt), shift = shift });
                    }
                    return Json(new { success = true, details = new List<ShiftDetailModel>() });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }
    }
}