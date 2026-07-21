using System;

namespace NtbSoft.ERP.Entity.SYSTEM
{
    public class LanguageResourceEntity
    {
        public long ResourceID { get; set; }
        public string ResourceKey { get; set; }
        public string LanguageID { get; set; }
        public string Value { get; set; }
        public string Module { get; set; }
        public string Description { get; set; }
        public bool IsHtml { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string UpdatedBy { get; set; }
    }

    public class LanguageResourceItem
    {
        public string ResourceKey { get; set; }
        public string LanguageID { get; set; }
        public string Value { get; set; }
        public string Module { get; set; }
        public string Description { get; set; }
        public bool? IsHtml { get; set; }
        public string UpdatedBy { get; set; }
    }
}