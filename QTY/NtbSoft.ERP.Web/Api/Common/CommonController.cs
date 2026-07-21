using Newtonsoft.Json;
using NtbSoft.ERP.Libs;
using NtbSoft.ERP.Model.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace NtbSoft.ERP.Web.Api.Common
{
    [RoutePrefix("api/Common")]
    public class CommonController : ApiController
    {

        [HttpPost]
        [Route("Get")]
        public DataTable Get(RequestGet req)

        {
            return new CommonWebModel().Get(req);
        }
        [HttpPost]
        [Route("GetByTypeTable")]
        public DataTable GetByTypeTable(RequestPost req)

        {
            return new CommonWebModel().GetByTypeTable(req);
        }
        [HttpPost]
        [Route("Post")]
        public string Post(RequestPost req)

        {
            return new CommonWebModel().Post(req);
        }
    }
}