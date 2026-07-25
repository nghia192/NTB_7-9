using System;
using System.Collections.Generic;

namespace NtbSoft.ERP.Entity.SYSTEM
{
    public class SelectItem
    {
        public string Value { get; set; }
        public string Text { get; set; }
    }

    public class ReportViewModel
    {
        public List<SelectItem> LineList { get; set; }
        public List<SelectItem> PCOList { get; set; }
    }

    public class ChecklistItem
    {
        public string Date { get; set; }          
        public string Location { get; set; }     
        public string line_id { get; set; }       
        public string QCName { get; set; }        
        public string BuyerSeason { get; set; }   
        public string PCONumber { get; set; }     
        public string Style { get; set; }         
        public string Color { get; set; }         
        public int OrderQuantity { get; set; }    
        public string ChecklistTime { get; set; } 
        public string ChecklistNames { get; set; } 
        public int ChecklistCount { get; set; }   
    }
}