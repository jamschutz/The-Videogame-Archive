using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using WebsiteBuilder.Utils;

namespace WebsiteBuilder.UI
{
    class Calendar
    {
        public Calendar()
        {
            // do nothing...
        }


        public string ToHtml(int month, int year)
        {
            StringBuilder calendarDates = new StringBuilder(4000);

            return $@"
                <div id=""calendar-month"">
                    <h4 class=""month-year-title""><button>&lt;&lt;</button><button>&lt;</button>
                    <span id=""calendar-title"">{Utils.Utils.GetMonthName(month)}, {year}</span><button>&gt;</button><button>&gt;&gt;</button></h4>
                    <div id=""calendar-border""></div>
                </div>
            ";
        }


        private string GetDay(int day, string dateString)
        {
            return $"<a class=\"day link-active\" href=\"/html/archive.html?date={dateString}\">{day}</a>";
        }
    }
}
