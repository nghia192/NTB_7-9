using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.Mvc;
using NtbSoft.ERP.Entity.SYSTEM;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using System.IO;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    public class ReportController : Controller
    {
        private string strConn = ConfigurationManager.ConnectionStrings["strCnn_ln"].ConnectionString;

        public ActionResult Index()
        {
            var model = new ReportViewModel
            {
                LineList = new List<SelectItem>(),
                PCOList = new List<SelectItem>()
            };
            string fromDate = DateTime.Now.AddDays(-30).ToString("yyyy-MM-dd");
            string toDate = DateTime.Now.ToString("yyyy-MM-dd");

            using (SqlConnection conn = new SqlConnection(strConn))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand("spQTY_ENDLINE_REPORT", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Action", "GetLineBC");
                    cmd.Parameters.AddWithValue("@Para1", fromDate);
                    cmd.Parameters.AddWithValue("@Para2", toDate);
                    cmd.Parameters.AddWithValue("@Para3", "");
                    cmd.Parameters.AddWithValue("@Para4", "");
                    cmd.Parameters.AddWithValue("@Para5", "");

                    using (SqlDataReader rd = cmd.ExecuteReader())
                    {
                        while (rd.Read())
                        {
                            model.LineList.Add(new SelectItem
                            {
                                Value = rd["Line"].ToString(),
                                Text = rd["Name"].ToString()
                            });
                        }
                    }
                }
                HashSet<string> pcoSet = new HashSet<string>();

                foreach (var line in model.LineList)
                {
                    using (SqlCommand cmdPco = new SqlCommand("spQTY_ENDLINE_REPORT", conn))
                    {
                        cmdPco.CommandType = CommandType.StoredProcedure;
                        cmdPco.Parameters.AddWithValue("@Action", "GetPCO");
                        cmdPco.Parameters.AddWithValue("@Para1", fromDate);
                        cmdPco.Parameters.AddWithValue("@Para2", toDate);

                        cmdPco.Parameters.AddWithValue("@Para3", line.Value);

                        cmdPco.Parameters.AddWithValue("@Para4", "");
                        cmdPco.Parameters.AddWithValue("@Para5", "");

                        using (SqlDataReader rdPco = cmdPco.ExecuteReader())
                        {
                            while (rdPco.Read())
                            {
                                string maPCO = rdPco["MaPCO"].ToString();
                                string tenPCO = rdPco["PCO"].ToString();

                                if (!pcoSet.Contains(maPCO))
                                {
                                    pcoSet.Add(maPCO);
                                    model.PCOList.Add(new SelectItem
                                    {
                                        Value = maPCO,
                                        Text = tenPCO
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return View(model);
        }

        [HttpPost]
        public ActionResult Search(string FromDate, string ToDate, List<string> SelectedLines, List<string> SelectedPCONumbers)
        {
            try
            {
                var checklistData = new List<ChecklistItem>();
                string paraLine = (SelectedLines != null && SelectedLines.Count > 0) ? SelectedLines[0] : "All";
                string paraPCO = (SelectedPCONumbers != null && SelectedPCONumbers.Count > 0) ? SelectedPCONumbers[0] : "All";

                DateTime parsedFromDate, parsedToDate;
                string sqlFromDate = DateTime.TryParseExact(FromDate, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out parsedFromDate) ? parsedFromDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd");
                string sqlToDate = DateTime.TryParseExact(ToDate, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out parsedToDate) ? parsedToDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd");

                using (SqlConnection conn = new SqlConnection(strConn))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand("spQTY_ENDLINE_REPORT", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Action", "GetDailyCheckList");
                        cmd.Parameters.AddWithValue("@Para1", paraLine);
                        cmd.Parameters.AddWithValue("@Para2", paraPCO);  
                        cmd.Parameters.AddWithValue("@Para3", "All");    
                        cmd.Parameters.AddWithValue("@Para4", sqlFromDate);
                        cmd.Parameters.AddWithValue("@Para5", sqlToDate);   

                        using (SqlDataReader rd = cmd.ExecuteReader())
                        {
                            while (rd.Read())
                            {
                                checklistData.Add(new ChecklistItem
                                {
                                    Date = Convert.ToDateTime(rd["CreateDate"]).ToString("yyyy-MM-dd"),
                                    Location = rd["AreaName"].ToString(),
                                    line_id = rd["LineID"].ToString(),
                                    QCName = rd["FullName"].ToString(),
                                    BuyerSeason = rd["BuyerSeason"].ToString(),
                                    PCONumber = rd["PlanCode"].ToString(),
                                    Style = rd["TenHang"].ToString(),
                                    Color = rd["ColorName"].ToString(),
                                    OrderQuantity = rd["SLKH"] != DBNull.Value ? Convert.ToInt32(rd["SLKH"]) : 0,
                                    ChecklistTime = rd["Time"].ToString(),
                                    ChecklistNames = rd["TenCheckList"].ToString(),
                                    ChecklistCount = rd["Count"] != DBNull.Value ? Convert.ToInt32(rd["Count"]) : 1
                                });
                            }
                        }
                    }
                }

                return Json(new { Success = true, ChecklistData = checklistData });
            }
            catch (Exception ex)
            {
                return Json(new { Success = false, Message = ex.Message });
            }
        }
        [HttpPost]
        public ActionResult ExportExcel(string FromDate, string ToDate, List<string> SelectedLines, List<string> SelectedPCONumbers, int TabIndex)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            string paraLine = (SelectedLines != null && SelectedLines.Count > 0) ? SelectedLines[0] : "All";
            string paraPCO = (SelectedPCONumbers != null && SelectedPCONumbers.Count > 0) ? SelectedPCONumbers[0] : "All";

            DateTime parsedFromDate, parsedToDate;
            string sqlFromDate = DateTime.TryParseExact(FromDate, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out parsedFromDate) ? parsedFromDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd");
            string sqlToDate = DateTime.TryParseExact(ToDate, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out parsedToDate) ? parsedToDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd");

            string templatePath = Server.MapPath("~/Content/Templates/Template_CheckList.xlsx");
            FileInfo templateFile = new FileInfo(templatePath);

            if (!templateFile.Exists)
            {
                return Content("Không tìm thấy file mẫu tại: " + templatePath + ". Vui lòng kiểm tra lại đường dẫn!");
            }

            using (var package = new ExcelPackage(templateFile))
            {
                var worksheet = package.Workbook.Worksheets[0];

                worksheet.Cells["A4"].Value = $"Thời gian: Từ {FromDate} đến {ToDate}";

                using (SqlConnection conn = new SqlConnection(strConn))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand("spQTY_ENDLINE_REPORT", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Action", TabIndex == 0 ? "GetDailyProduction" : "GetDailyCheckList");
                        cmd.Parameters.AddWithValue("@Para1", paraLine);
                        cmd.Parameters.AddWithValue("@Para2", paraPCO);
                        cmd.Parameters.AddWithValue("@Para3", "All");
                        cmd.Parameters.AddWithValue("@Para4", sqlFromDate);
                        cmd.Parameters.AddWithValue("@Para5", sqlToDate);

                        using (SqlDataReader rd = cmd.ExecuteReader())
                        {
                            worksheet.Cells["A6"].LoadFromDataReader(rd, true);
                        }
                    }
                }

                if (worksheet.Dimension != null)
                {
                    int totalCols = worksheet.Dimension.End.Column;
                    using (var headerRange = worksheet.Cells[6, 1, 6, totalCols])
                    {
                        headerRange.Style.Font.Bold = true;
                        headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        headerRange.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(21, 32, 43)); 
                        headerRange.Style.Font.Color.SetColor(Color.White);
                        headerRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        headerRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        headerRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        headerRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        headerRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    }
                    worksheet.Cells.AutoFitColumns();
                }

                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;

                string excelName = (TabIndex == 0 ? "Rework_" : "Checklist_") + DateTime.Now.ToString("yyyyMMdd_HHmm") + ".xlsx";
                return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
            }
        }
    }
}