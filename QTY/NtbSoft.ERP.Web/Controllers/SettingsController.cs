using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace NtbSoft.ERP.Web.Controllers
{
    public class SettingsController : Controller
    {
        public ActionResult PCO()
        {
            return View("~/Views/Settings/PCO.cshtml");
        }
        public ActionResult LoiQA()
        {
            return View("~/Views/Settings/LoiQA.cshtml");
        }
    }
}