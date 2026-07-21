using Newtonsoft.Json;
using NtbSoft.ERP.Model.ThuVien;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Runtime.Caching;
using System.Web.Http;
using WebApplication.Entity;

namespace NtbSoft.ERP.Web.Api.ThuVien
{
    [RoutePrefix("api/SYS_Login")]
    public class SYS_LoginController : ApiController
    {
        private static readonly ObjectCache OtpCache = MemoryCache.Default;
        private const int OTP_EXPIRE_MINUTES = 5;

        private const string SMTP_USER = "ngocmanh445@gmail.com";
        private const string SMTP_APP_PASSWORD = "gszl uujj jycc obqa";

        [HttpGet]
        [Route("Get")]
        public string Get(string para1, string para2)
        {
            if (para1 == "" || para2 == "") return null;
            DataTable dtTable = new SYS_LoginModel().Get();
            string json = JsonConvert.SerializeObject(dtTable);
            List<Login> login = JsonConvert.DeserializeObject<List<Login>>(json);
            Login user = login.Where(x => x.UserName.ToLower() == para1.Trim().ToLower()).FirstOrDefault();
            if (user == null) return "Tên đăng nhập không đúng";
            else
            {
                MD5StringCrypt Md5Crypt = new MD5StringCrypt();
                string deCrypt = Md5Crypt.Decrypt(user.Password, true);
                if (deCrypt == para2) return "true";
                else return null;
            }
        }

        // ============================================================
        //  POST api/SYS_Login/Login
        //  Body: { "Username": "...", "Password": "...", "DeviceId": "..." }
        //  Thay cho "Get" ở trên, có thêm kiểm tra thiết bị + gửi OTP
        // ============================================================
        [HttpPost]
        [Route("Login")]
        public LoginResponse Login([FromBody] LoginRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
                return new LoginResponse { Status = "error", Message = "Thiếu thông tin đăng nhập" };

            // 1) Lấy user + kiểm tra tài khoản tồn tại (dùng lại đúng cách lấy dữ liệu cũ)
            DataTable dtTable = new SYS_LoginModel().Get();
            string json = JsonConvert.SerializeObject(dtTable);
            List<Login> loginList = JsonConvert.DeserializeObject<List<Login>>(json);
            Login user = loginList.Where(x => x.UserName.ToLower() == req.Username.Trim().ToLower()).FirstOrDefault();

            if (user == null)
                return new LoginResponse { Status = "invalid_account", Message = "Tài khoản không tồn tại" };

            // 2) Kiểm tra mật khẩu (giải mã MD5 giống code cũ)
            MD5StringCrypt Md5Crypt = new MD5StringCrypt();
            string deCrypt = Md5Crypt.Decrypt(user.Password, true);
            if (deCrypt != req.Password)
                return new LoginResponse { Status = "invalid_password", Message = "Sai mật khẩu" };

            TimeSpan sessionValidTime = new TimeSpan(7, 0, 0, 0); // hiện tại: 30 phút

            bool trustedDevice = !string.IsNullOrWhiteSpace(req.DeviceId) && IsTrustedDevice(user.UserName, req.DeviceId);
            bool recentLogin = user.NgayLog.HasValue && (DateTime.Now - user.NgayLog.Value) < sessionValidTime;

            if (trustedDevice && recentLogin)
            {
                return new LoginResponse { Status = "success", Message = "Đăng nhập thành công" };
            }

            // 4) Chưa tin cậy -> sinh OTP, gửi qua email
            if (string.IsNullOrWhiteSpace(user.Email))
                return new LoginResponse { Status = "error", Message = "Tài khoản chưa có email để xác thực OTP" };

            string otp = GenerateAndStoreOtp(user.UserName);
            SendOtpEmail(user.Email, otp);

            return new LoginResponse
            {
                Status = "need_otp",
                Message = "Mã OTP đã được gửi tới email của bạn",
                EmailMask = MaskEmail(user.Email)
            };
        }

        [HttpPost]
        [Route("VerifyOtp")]
        public LoginResponse VerifyOtp([FromBody] VerifyOtpRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Otp))
                return new LoginResponse { Status = "error", Message = "Thiếu thông tin xác thực" };

            string cacheKey = "OTP_" + req.Username.Trim().ToLower();
            string cachedOtp = OtpCache.Get(cacheKey) as string;

            if (cachedOtp == null)
                return new LoginResponse { Status = "otp_expired", Message = "Mã OTP đã hết hạn, vui lòng đăng nhập lại" };

            if (cachedOtp != req.Otp.Trim())
                return new LoginResponse { Status = "invalid_otp", Message = "Mã OTP không đúng" };

            OtpCache.Remove(cacheKey);

            // OTP đúng -> lưu thiết bị vào SYS_TrustedDevice
            if (!string.IsNullOrWhiteSpace(req.DeviceId))
            {
                string userAgent = Request.Headers.UserAgent?.ToString();
                string deviceType = DetectDeviceType(userAgent);
                SaveTrustedDevice(req.Username, req.DeviceId, deviceType);
            }

            return new LoginResponse { Status = "success", Message = "Đăng nhập thành công" };
        }

        // ============================================================
        //  POST api/SYS_Login/ResendOtp
        //  Body: { "Username": "..." }
        // ============================================================
        [HttpPost]
        [Route("ResendOtp")]
        public LoginResponse ResendOtp([FromBody] ResendOtpRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Username))
                return new LoginResponse { Status = "error", Message = "Thiếu tên đăng nhập" };

            DataTable dtTable = new SYS_LoginModel().Get();
            string json = JsonConvert.SerializeObject(dtTable);
            List<Login> loginList = JsonConvert.DeserializeObject<List<Login>>(json);
            Login user = loginList.Where(x => x.UserName.ToLower() == req.Username.Trim().ToLower()).FirstOrDefault();

            if (user == null || string.IsNullOrWhiteSpace(user.Email))
                return new LoginResponse { Status = "error", Message = "Không tìm thấy email của tài khoản" };

            string otp = GenerateAndStoreOtp(user.UserName);
            SendOtpEmail(user.Email, otp);

            return new LoginResponse
            {
                Status = "need_otp",
                Message = "Đã gửi lại mã OTP",
                EmailMask = MaskEmail(user.Email)
            };
        }

        // ============================================================
        //  GET api/SYS_Login/GetUserDashBoard  (giữ nguyên)
        // ============================================================
        [HttpGet]
        [Route("GetUserDashBoard")]
        public DataTable GetUserDashBoard(string para1)
        {
            return new SYS_LoginModel().GetPhanQuyenUserWebDashBoard(para1);
        }

        // ============================================================
        //  Helper: OTP
        // ============================================================
        private static string GenerateAndStoreOtp(string username)
        {
            string otp = new Random(Guid.NewGuid().GetHashCode()).Next(0, 1000000).ToString("D6");
            string cacheKey = "OTP_" + username.Trim().ToLower();
            OtpCache.Set(cacheKey, otp, DateTimeOffset.Now.AddMinutes(OTP_EXPIRE_MINUTES));
            return otp;
        }

        private static void SendOtpEmail(string toEmail, string otp)
        {
            using (var smtp = new SmtpClient("smtp.gmail.com", 587))
            {
                smtp.EnableSsl = true;
                smtp.UseDefaultCredentials = false; // QUAN TRỌNG: phải đặt false trước khi set Credentials
                smtp.Credentials = new NetworkCredential(SMTP_USER, SMTP_APP_PASSWORD);

                using (var mail = new MailMessage())
                {
                    mail.From = new MailAddress(SMTP_USER, "PMS - He thong quan ly chat luong");
                    mail.To.Add(toEmail);
                    mail.Subject = "Mã xác thực đăng nhập (OTP)";
                    mail.IsBodyHtml = true;
                    mail.Body = $@"
                        <div style='font-family:Arial,sans-serif;font-size:14px;color:#0f1f3d;line-height:1.6;'>
                            <p>Xin chào,</p>
                            <p>Hệ thống phát hiện bạn đang đăng nhập từ một thiết bị mới. Mã OTP xác thực của bạn là:</p>
                            <div style='text-align:center;margin:24px 0;'>
                                <span style='display:inline-block;font-size:30px;font-weight:bold;color:#1a56db;
                                             letter-spacing:6px;background:#f0f4ff;padding:12px 28px;border-radius:10px;'>{otp}</span>
                            </div>
                            <p>Mã có hiệu lực trong <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                        </div>";

                    smtp.Send(mail);
                }
            }
        }

        private static string MaskEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@")) return email;
            var parts = email.Split('@');
            var name = parts[0];
            var domain = parts[1];
            if (name.Length <= 3) return name[0] + "***@" + domain;
            return name.Substring(0, 3) + "***" + name.Substring(name.Length - 1) + "@" + domain;
        }

        // ============================================================
        //  Helper: Trusted Device (bảng SYS_TrustedDevice - xem script SQL cuối file)
        // ============================================================
        private static bool IsTrustedDevice(string username, string deviceId)
        {
            using (var conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            using (var cmd = new SqlCommand(
                "SELECT COUNT(1) FROM SYS_TrustedDevice WHERE Username = @Username AND DeviceID = @DeviceID", conn))
            {
                cmd.Parameters.AddWithValue("@Username", username);
                cmd.Parameters.AddWithValue("@DeviceID", deviceId);
                if (conn.State != ConnectionState.Open) conn.Open();
                return (int)cmd.ExecuteScalar() > 0;
            }
        }

        private static void SaveTrustedDevice(string username, string deviceId, string deviceType)
        {
            using (var conn = NtbSoft.ERP.Libs.SqlHelper.GetConnection())
            using (var cmd = new SqlCommand(@"
                IF EXISTS (SELECT 1 FROM SYS_TrustedDevice WHERE Username = @Username AND DeviceID = @DeviceID)
                    UPDATE SYS_TrustedDevice SET LastUsedDate = GETDATE(), DeviceType = @DeviceType
                    WHERE Username = @Username AND DeviceID = @DeviceID
                ELSE
                    INSERT INTO SYS_TrustedDevice (Username, DeviceID, DeviceType, CreatedDate, LastUsedDate)
                    VALUES (@Username, @DeviceID, @DeviceType, GETDATE(), GETDATE());", conn))
            {
                cmd.Parameters.AddWithValue("@Username", username);
                cmd.Parameters.AddWithValue("@DeviceID", deviceId);
                cmd.Parameters.AddWithValue("@DeviceType", deviceType ?? "Không xác định");
                if (conn.State != ConnectionState.Open) conn.Open();
                cmd.ExecuteNonQuery();
            }
        }

        /// <summary>Nhận diện thiết bị là Máy tính hay Điện thoại/Tablet dựa vào User-Agent của trình duyệt</summary>
        private static string DetectDeviceType(string userAgent)
        {
            if (string.IsNullOrWhiteSpace(userAgent)) return "Không xác định";

            string ua = userAgent.ToLower();

            if (ua.Contains("ipad") || ua.Contains("tablet") ||
                (ua.Contains("android") && !ua.Contains("mobile")))
                return "Máy tính bảng";

            if (ua.Contains("mobile") || ua.Contains("iphone") || ua.Contains("android"))
                return "Điện thoại";

            return "Máy tính";
        }
    }

    // ============================================================
    //  Models
    // ============================================================
    public class Login
    {
        public string UserName { get; set; }
        public string Password { get; set; }

        public string Email { get; set; }
        public DateTime? NgayLog { get; set; }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string DeviceId { get; set; }
    }

    public class VerifyOtpRequest
    {
        public string Username { get; set; }
        public string Otp { get; set; }
        public string DeviceId { get; set; }
    }

    public class ResendOtpRequest
    {
        public string Username { get; set; }
    }

    // Status: invalid_account | invalid_password | need_otp | success | invalid_otp | otp_expired | error
    public class LoginResponse
    {
        public string Status { get; set; }
        public string Message { get; set; }
        public string EmailMask { get; set; }
    }
}
