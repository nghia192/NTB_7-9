using Newtonsoft.Json;
using NtbSoft.ERP.Model.ThuVien;
using OfficeOpenXml;
using OfficeOpenXml.Drawing;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Net.Http.Headers;
using WebApplication.Entity;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    [RoutePrefix("api/Dic_PBan_ChucVu")]
    public class Dic_PBan_ChucVuController : ApiController
    {
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para1 = "", string para2 = "", string para3 = "")
        {
            return new Dic_PBanChucVuModel().Get(action, para1, para2, para3);
        }
      
     
        [HttpPost]
        [Route("PostPhongBan")]
        public string PostPhongBan(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<Department>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);

            return new Dic_PBanChucVuModel().Post(action, "@TypeDepartment", tbl);
        }
       
        [HttpPost]
        [Route("PostChuVu")]
        public string PostChuVu(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<Position>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);

            return new Dic_PBanChucVuModel().Post(action, "@TypePosition", tbl);
        }
    }
    public class Department
    {

        public string DepartmentName { get; set; }

        public string DepartmentCode { get; set; }

        public string Status { get; set; }

        public string Description { get; set; }

    }
    public class Position
    {

        public string PositionName { get; set; }

        public string PositionCode { get; set; }

    }
}

