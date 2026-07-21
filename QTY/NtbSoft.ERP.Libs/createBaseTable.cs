using System;
using System.Collections.Generic;
using System.Data;

namespace NtbSoft.ERP.Libs
{
    public class CreateNewDataTable
    {
        public string TableName { get; set; }
        public DataTable TypeTable { get; set; }

        private static readonly Dictionary<string, Func<DataTable>> tableFactories =
            new Dictionary<string, Func<DataTable>> {
                { "ERP_QC_PHANBOPO", ERP_QC_PHANBOPO },
                { "QTY_QA_PHANLOAILOI", QTY_QA_PHANLOAILOI },
                { "QTY_QA_PHANLOAIKCSQA", QTY_QA_PHANLOAIKCSQA },
                { "QTY_QA_PHANLOAIBOPHAN", QTY_QA_PHANLOAIBOPHAN },
                { "QTY_QA_KCSQA", QTY_QA_KCSQA },
                { "QTY_QA_BOPHAN", QTY_QA_BOPHAN },
                { "QTY_QA_HANGMUCLOI", QTY_QA_HANGMUCLOI },
                { "QTY_QA_NHOMLOI", QTY_QA_NHOMLOI },
                { "PCO_MAUSIZE", PCO_MAUSIZE },
                { "ERP_PCO_CHUYENMAY", ERP_PCO_CHUYENMAY },
                { "ERP_PCO_TONG", ERP_PCO_TONG },
                { "ERP_PCO_CHITIET", ERP_PCO_CHITIET },
                { "ERP_LENHSX", ERP_LENHSX },
                { "ERP_MAHANG", ERP_MAHANG },
                { "ERP_KHACHHANG", ERP_KHACHHANG },
            };
        public CreateNewDataTable _default(string table)
        {
            DataTable dt = null; 
            if (tableFactories.TryGetValue(table, out var factory)) 
            { 
                dt = factory(); 
            }
            return new CreateNewDataTable
            {
                TableName = table,
                TypeTable = dt
            };   
        }

        public static DataTable BASE_TABLE()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("MaDH", typeof(string));
            dt.Columns.Add("MaKH", typeof(string));
            dt.Columns.Add("MaHang", typeof(string));
            dt.Columns.Add("MaVTID", typeof(string));
            dt.Columns.Add("MaCLVT", typeof(string));
            dt.Columns.Add("MauVTID", typeof(string));
            dt.Columns.Add("KhoVaiID", typeof(string));
            return dt;
        }

        public static DataTable ERP_KHACHHANG()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            dt.Columns.Add("MaKH", typeof(string));
            dt.Columns.Add("KeyKH", typeof(string));
            dt.Columns.Add("CodeKH", typeof(string));
            dt.Columns.Add("TenKH", typeof(string));
            dt.Columns.Add("LoaiKH", typeof(string));
            dt.Columns.Add("MoTa", typeof(string));
            return dt;
        }

        public static DataTable ERP_MAHANG()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            dt.Columns.Add("MaKH", typeof(string));
            dt.Columns.Add("MaHang", typeof(string));
            dt.Columns.Add("KeyHang", typeof(string));
            dt.Columns.Add("CodeHang", typeof(string));
            dt.Columns.Add("TenHang", typeof(string));
            dt.Columns.Add("LoaiHang", typeof(string));            
            dt.Columns.Add("SoLuong", typeof(int));
            dt.Columns.Add("TGHoanThanhDK", typeof(DateTime));
            dt.Columns.Add("TGHoanThanhTT", typeof(DateTime));
            return dt;
        }

        public static DataTable ERP_LENHSX()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            dt.Columns.Add("MaKH", typeof(string));
            dt.Columns.Add("MaHang", typeof(string));
            dt.Columns.Add("MaLenh", typeof(string));
            dt.Columns.Add("KeyLenh", typeof(string));
            dt.Columns.Add("CodeLenh", typeof(string));
            dt.Columns.Add("TenLenh", typeof(string));
            dt.Columns.Add("LoaiLenh", typeof(string));
            dt.Columns.Add("MaTienTe", typeof(string));           
            dt.Columns.Add("Season", typeof(string));
            dt.Columns.Add("SoLuong", typeof(int));
            dt.Columns.Add("TGHoanThanhDK", typeof(DateTime));
            dt.Columns.Add("TGHoanThanhTT", typeof(DateTime));
            return dt;
        }

        public static DataTable ERP_PCO_TONG()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            dt.Columns.Add("MaKH", typeof(string));
            dt.Columns.Add("MaHang", typeof(string));
            dt.Columns.Add("MaLenh", typeof(string));
            dt.Columns.Add("MaPCO", typeof(string));
            dt.Columns.Add("KeyPCO", typeof(string));
            dt.Columns.Add("CodePCO", typeof(string));
            dt.Columns.Add("TenPCO", typeof(string));
            dt.Columns.Add("LoaiPCO", typeof(string));
            dt.Columns.Add("Season", typeof(string));
            dt.Columns.Add("SeasonBuy", typeof(string));           
            dt.Columns.Add("NewCo", typeof(string));
            dt.Columns.Add("SoLuong", typeof(int));
            dt.Columns.Add("TGGiaoHangDK", typeof(DateTime));
            dt.Columns.Add("TGGiaoHangTT", typeof(DateTime));
            dt.Columns.Add("TGHoanThanhDK", typeof(DateTime));
            dt.Columns.Add("TGHoanThanhTT", typeof(DateTime));
            return dt;
        }
        public static DataTable ERP_PCO_CHITIET()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            dt.Columns.Add("MaPCO", typeof(string));
            dt.Columns.Add("MaMau", typeof(string));
            dt.Columns.Add("MaNhomSize", typeof(string));
            dt.Columns.Add("MaSize", typeof(string));
            dt.Columns.Add("Order", typeof(string));
            dt.Columns.Add("SoLuong", typeof(int));
            dt.Columns.Add("TGHoanThanhDK", typeof(DateTime));
            dt.Columns.Add("TGHoanThanhTT", typeof(DateTime));
            return dt;
        }

        public static DataTable ERP_PCO_CHUYENMAY()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            dt.Columns.Add("MaPCO", typeof(string));
            dt.Columns.Add("MaMau", typeof(string));
            dt.Columns.Add("MaNhomSize", typeof(string));
            dt.Columns.Add("MaSize", typeof(string));
            dt.Columns.Add("MaChuyenMay", typeof(string));
            dt.Columns.Add("Order", typeof(string));
            dt.Columns.Add("LoaiPhanBo", typeof(string));
            dt.Columns.Add("SoLuong", typeof(int));
            dt.Columns.Add("TGVaoChuyenDK", typeof(DateTime));
            dt.Columns.Add("TGVaoChuyenTT", typeof(DateTime));
            dt.Columns.Add("TGKetThucDK", typeof(DateTime));
            dt.Columns.Add("TGKetThucTT", typeof(DateTime));
            return dt;
        }
        public static DataTable PCO_MAUSIZE()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("MaMau", typeof(string));
            dt.Columns.Add("MaHang", typeof(string));
            dt.Columns.Add("CodeMau", typeof(string));
            dt.Columns.Add("TenMau", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("MaKH", typeof(string));
            dt.Columns.Add("MaTheMau", typeof(string));
            dt.Columns.Add("MaSize", typeof(string));
            dt.Columns.Add("CodeSize", typeof(string));
            dt.Columns.Add("TenSize", typeof(string));
            dt.Columns.Add("SizeSanXuat", typeof(string));
            dt.Columns.Add("XacNhan", typeof(int));
            dt.Columns.Add("SizeXacNhan", typeof(string));
            dt.Columns.Add("MaNhomSize", typeof(string));
            dt.Columns.Add("NhomSize", typeof(string));
            dt.Columns.Add("Sort", typeof(int));
            dt.Columns.Add("MaTheSize", typeof(string));
            dt.Columns.Add("MaTheInSeam", typeof(string));
            dt.Columns.Add("SortIs", typeof(int));
            return dt;
        }

        public static DataTable QTY_QA_NHOMLOI()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("ID", typeof(int));
            dt.Columns.Add("Name", typeof(string));
            dt.Columns.Add("NameEn", typeof(string));
            dt.Columns.Add("BackColor", typeof(string));
            dt.Columns.Add("ForColor", typeof(string));
            dt.Columns.Add("IconCls", typeof(string));
            dt.Columns.Add("Sort", typeof(int));
            dt.Columns.Add("CodeNhomLoi", typeof(string));
            dt.Columns.Add("MaLoi", typeof(string));
            dt.Columns.Add("MaLoiCu", typeof(string));
            dt.Columns.Add("NhomLoi", typeof(int));
            dt.Columns.Add("TenLoi", typeof(string));
            dt.Columns.Add("TenLoiEng", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("LoaiLoi", typeof(int));
            dt.Columns.Add("MaHangMuc", typeof(string));
            dt.Columns.Add("MaNhomLoi", typeof(string));
            dt.Columns.Add("MaNhomLoiCu", typeof(string));
            return dt;
        }
        public static DataTable QTY_QA_PHANLOAIBOPHAN()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("MaNhomLoi", typeof(string));
            dt.Columns.Add("MaBoPhan", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            return dt;
        }
        public static DataTable QTY_QA_PHANLOAIKCSQA()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("MaNhomLoi", typeof(string));
            dt.Columns.Add("MaModule", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            return dt;
        }
        public static DataTable QTY_QA_PHANLOAILOI()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("MaLoi", typeof(string));
            dt.Columns.Add("MaLoaiLoi", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            return dt;
        }
        public static DataTable QTY_QA_BOPHAN()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("MaBoPhan", typeof(string));
            dt.Columns.Add("TenBoPhan", typeof(string));
            dt.Columns.Add("CodeBoPhan", typeof(string));
            dt.Columns.Add("MaLoaiBoPhan", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            return dt;
        }
        public static DataTable QTY_QA_KCSQA()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("MaModule", typeof(string));
            dt.Columns.Add("TenModule", typeof(string));
            dt.Columns.Add("CodeModule", typeof(string));
            dt.Columns.Add("MaLoaiModule", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            return dt;
        }
        public static DataTable QTY_QA_HANGMUCLOI()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("MaHangMucLoi", typeof(string));
            dt.Columns.Add("TenHangMucLoi", typeof(string));
            dt.Columns.Add("CodeHangMucLoi", typeof(string));
            dt.Columns.Add("MaLoaiHangMucLoi", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            return dt;
        }

        public static DataTable ERP_QC_PHANBOPO()
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TGTao", typeof(DateTime));
            dt.Columns.Add("NguoiTao", typeof(string));
            dt.Columns.Add("TGCapNhat", typeof(DateTime));
            dt.Columns.Add("NguoiCapNhat", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));
            dt.Columns.Add("MaNhapQC", typeof(string));
            dt.Columns.Add("MaChuyenMay", typeof(string));
            dt.Columns.Add("MaLenh", typeof(string));
            dt.Columns.Add("MaMau", typeof(string));
            dt.Columns.Add("DauSize", typeof(string));
            dt.Columns.Add("Size", typeof(string));
            dt.Columns.Add("PO", typeof(string));
            dt.Columns.Add("SoLuong", typeof(int));
            dt.Columns.Add("SLPhanBo", typeof(int));
            dt.Columns.Add("Code_TNC", typeof(string));
            dt.Columns.Add("BanCat", typeof(string));
            dt.Columns.Add("SoBo", typeof(string));
            dt.Columns.Add("TrangThai", typeof(int));
            return dt;
        }
        
    }
}

