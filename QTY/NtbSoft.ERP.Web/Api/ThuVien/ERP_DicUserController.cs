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
    [RoutePrefix("api/ERP_DicUser")]
    public class ERP_DicUserController : ApiController
    {
        MD5StringCrypt Md5Crypt = new MD5StringCrypt();
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "", string para6 = "", string para7 = "", string para8 = "")
        {
            return new ERP_DicUserModel().Get(action, para1, para2, para3, para4, para5, para6, para7, para8);
        }
        [HttpGet]
        [Route("GetUserName")]
        public DataTable GetUserName(string action, string para1 = "", string para2 = "", string para3 = "", string para4 = "", string para5 = "", string para6 = "", string para7 = "", string para8 = "")
        {
            string PassWord = Md5Crypt.Encrypt(para2, true);
            return new ERP_DicUserModel().Get(action, para1, PassWord, para3, para4, para5, para6, para7, para8);
        }
        [HttpPost]
        [Route("Post")]
        public string Post(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<Dic_Area>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);

            return new ERP_DicUserModel().Post(action, tbl);
        }
        [HttpPost]
        [Route("PostLine")]
        public string PostLine(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<Dic_Line>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);

            return new ERP_DicUserModel().PostLine(action, tbl);
        }
        [HttpPost]
        [Route("PostModule")]
        public string PostModule(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<Dic_Line>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);

            return new ERP_DicUserModel().PostModule(action, tbl);
        }
        [HttpPost]
        [Route("SaveUser")]
        public string SaveUser(string action, dynamic data)
        {
            string usname = data[0].UserName;
            string fullName = data[0].FullName;
            string PassWord = Md5Crypt.Encrypt(data[0].Password.ToString(), true);
            return new ERP_DicUserModel().SaveUser(action, usname, PassWord, fullName);

        }
        [HttpPost]
        [Route("PostPQ")]
        public string PostPQ(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<UserModulePermission>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);

            return new ERP_DicUserModel().PostPQ(action, tbl);
        }
        [HttpPost]
        [Route("PostRoleGroup")]
        public string PostRoleGroup(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<RoleGroup>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);

            return new ERP_DicUserModel().PostAll(action, tbl, "@TypeRoleGroup");
        }
        [HttpPost]
        [Route("PostUser")]
        public string PostUser(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<TblUser>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);
            string PassWord = Md5Crypt.Encrypt(tbl.Rows[0]["Password"].ToString(), true);
            foreach (DataRow item in tbl.Rows)
            {
                item["Password"] = PassWord;
            }
            return new ERP_DicUserModel().PostAll(action, tbl, "@TypeTblUser");
        }
        [HttpPost]
        [Route("PostGroupModule")]
        public string PostGroupModule(string action, dynamic data)
        {
            string json = JsonConvert.SerializeObject(data);
            var listData = JsonConvert.DeserializeObject<List<QTY_GroupMODULESQTY>>(json);
            string jsonL = JsonConvert.SerializeObject(listData);
            DataTable tbl = JsonConvert.DeserializeObject<DataTable>(jsonL);
          
            return new ERP_DicUserModel().PostAll(action, tbl, "@TypeGroupModule");
        }
    }
    public class Dic_Area
    {
        public string AreaId { get; set; }
        public string AreaName { get; set; }
        public string AreaCode { get; set; }
        public string Address { get; set; }
        public string CreatedBy { get; set; }
        public int? Sort { get; set; }

    }
    public class Dic_Line
    {
        public string ID { get; set; }
        public string Line_ID { get; set; }

        public string Line_Name { get; set; }

        public string MaKV { get; set; }
        public int? Sort { get; set; }
    }
    public class UserModulePermission
    {

        public string UserID { get; set; }

        public string Module { get; set; }

        public int? IsView { get; set; }

        public int? IsEdit { get; set; }

        public int? IsDelete { get; set; }
    }

    public class RoleGroup
    {

        public string GroupID { get; set; }

        public string GroupName { get; set; }

        public string Description { get; set; }

        public int? IsActive { get; set; }

    }
    public class TblUser
    {
        public string LoginID { get; set; }

        public string Password { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }

        public string EmployeeCode { get; set; }

        public string Phone { get; set; }

        public int? Gender { get; set; }

        public string Role { get; set; }

        public string DepartmentId { get; set; }

        public string PositionId { get; set; }

        public string GroupID { get; set; }

        public string Status { get; set; }

        public string Description { get; set; }
    }
    public class QTY_GroupMODULESQTY
    {
        public string GroupID { get; set; }

        public string ModuleQTY { get; set; }

        public int? IsView { get; set; }

        public int? IsEdit { get; set; }

        public int? IsDelete { get; set; }
    }
}

