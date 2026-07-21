using Newtonsoft.Json;
using NtbSoft.ERP.Model.ThuVien;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    [RoutePrefix("api/Dic_ChungLoaiCongDoan")]
    public class Dic_ChungLoaiCongDoanController : ApiController
    {
        [HttpGet]
        [Route("Get")]
        public DataTable Get(string action, string para1 = "", string para2 = "", string para3 = "")
        {
            return new Dic_ChungLoaiCongDoanModel().Get(action, para1, para2, para3);
        }
        [HttpPost]
        [Route("PostChungLoai")]
        public string Post(string action, List<TYPE_ERP_Dic_ChungLoai> lstSave, string type = "")
        {
            string json = JsonConvert.SerializeObject(lstSave);
            DataTable tblChungLoai = JsonConvert.DeserializeObject<DataTable>(json);
            return new Dic_ChungLoaiCongDoanModel().Post(action, type, tblChungLoai);
        }

        [HttpPost]
        [Route("PostCongDoan")]
        public string PostCongDoan(string action, List<TYPE_ERP_Dic_CongDoan> lstSave, string type = "")
        {
            string json = JsonConvert.SerializeObject(lstSave);
            DataTable tblCongDoan = JsonConvert.DeserializeObject<DataTable>(json);
            return new Dic_ChungLoaiCongDoanModel().Post(action, type, tblCongDoan);
        }

        [HttpPost]
        [Route("PostViTri")]
        public string PostViTri(string action, List<TYPE_ERP_Dic_ViTri> lstSave, string type = "")
        {
            string json = JsonConvert.SerializeObject(lstSave);
            DataTable tblCongDoan = JsonConvert.DeserializeObject<DataTable>(json);
            return new Dic_ChungLoaiCongDoanModel().Post(action, type, tblCongDoan);
        }
    }

    public class TYPE_ERP_Dic_ChungLoai
    {
        public string MaCL { get; set; }

        public string TenCL { get; set; }

        public string GhiChu { get; set; }

        public string NguoiTao { get; set; }

        public string NguoiSua { get; set; }

        public string TenCLTiengAnh { get; set; }
    }

    public class TYPE_ERP_Dic_CongDoan
    {
        public string TenCongDoan { get; set; }

        public string MaCongDoan { get; set; }

        public string GhiChu { get; set; }

        public string ChungLoai { get; set; }
        public int? Sort { get; set; }

        public string NguoiTao { get; set; }

        public string NguoiSua { get; set; }
        public string TenCongDoanTA { get; set; }
        public string MaViTri { get; set; }
    }

    public class TYPE_ERP_Dic_ViTri
    {
        public string MaViTri { get; set; }
        public string MaCL { get; set; }

        public string TenViTri { get; set; }

        public string NguoiTao { get; set; }

    }
}