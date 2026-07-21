using Newtonsoft.Json;
using NtbSoft.ERP.Model.ThuVien;
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

[RoutePrefix("api/Dic_CheckList")]
public class Dic_CheckListController : ApiController
{
    [HttpGet]
    [Route("Get")]
    public DataTable Get(string action, string para1 = "", string para2 = "", string para3 = "")
    {
        return new Dic_CheckListModel().Get(action, para1, para2, para3);
    }

    [HttpPost]
    [Route("Post")]
    public string Post(string action, List<TYPE_ERP_Dic_CheckList> lstSave, string type = "")
    {
        int index = 0;
        foreach (var item in lstSave)
        {
            string datetime = DateTime.Now.ToString("ddMMyyyyHHmmssfff") + "_" + index;

            string imageText = item.HinhCheckList;
            string imageName = SaveSignatureImage(imageText, $"{item.NguoiTao}", "CheckList", datetime);

            item.HinhCheckList = imageName;
            index++;
        }

        string json = JsonConvert.SerializeObject(lstSave);
        DataTable tblChungLoai = JsonConvert.DeserializeObject<DataTable>(json);
        return new Dic_CheckListModel().Post(action, type, tblChungLoai);
    }

    [HttpPost]
    [Route("Delete")]
    public string Delete(string action, List<TYPE_ERP_Dic_CheckList> data, string type = "")
    {
        string json = JsonConvert.SerializeObject(data);
        DataTable tblDelete = JsonConvert.DeserializeObject<DataTable>(json);
        return new Dic_CheckListModel().Post(action, type, tblDelete);
    }

    private string SaveSignatureImage(string base64Data, string role, string module, string datetime)
    {
        if (string.IsNullOrEmpty(base64Data)) return "";

        string[] parts = base64Data.Split(',');
        if (parts.Length < 2) return base64Data;

        byte[] bytes = Convert.FromBase64String(parts[1]);
        using (MemoryStream ms = new MemoryStream(bytes))
        {
            Image image = Image.FromStream(ms);
            string fileName = $"{role}-{module}-{datetime}.png";
            string uploadPath = HttpContext.Current.Server.MapPath("~/img/CheckList");

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            string fullPath = Path.Combine(uploadPath, fileName);
            if (File.Exists(fullPath))
                File.Delete(fullPath);

            image.Save(fullPath);
            return $"/{fileName}";
        }
    }

}

public class TYPE_ERP_Dic_CheckList
{
    public int? ID { get; set; }

    public string TenCheckList { get; set; }

    public string HinhCheckList { get; set; }

    public string NguoiTao { get; set; }
}