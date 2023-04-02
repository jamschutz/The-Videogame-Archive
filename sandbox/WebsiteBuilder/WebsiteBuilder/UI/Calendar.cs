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
        private DbManager dbManager;

        public Calendar(DbManager dbManager)
        {
            this.dbManager = dbManager;
        }


        public string ToHtml(int month, int year)
        {
            //StringBuilder calendarDates = new StringBuilder(4000);
            //string yearMonthString = $"{year}{Utils.Utils.GetTwoCharInt(month)}";
            //int daysInMonth = Utils.Utils.GetDaysInMonth(month, year);
            //var dateArticleCount = dbManager.GetArticleCountBetweenDates($"{yearMonthString}01", $"{yearMonthString}{daysInMonth}");

            //calendarDates.AppendLine("<div id=\"calendar-dates\">");
            //calendarDates.AppendLine("\t<div class=\"weekday-header\">");
            //foreach (var weekday in new string[] { "S", "M", "T", "W", "T", "F", "S" }) {
            //    calendarDates.AppendLine($"\t\t<a class=\"weekday-label\">{weekday}</a>");
            //}
            //calendarDates.AppendLine("\t</div>");
            //for (int i = 1; i <= daysInMonth; i++) {
            //    calendarDates.AppendLine($"\t{}");
            //}

            return @"
                <div id=""calendar-month"">
                </div>
            ";


            //return $@"
            //    <div id=""calendar-month"">
            //        <h4 class=""month-year-title""><button>&lt;&lt;</button><button>&lt;</button>
            //        <span id=""calendar-title"">{Utils.Utils.GetMonthName(month)}, {year}</span><button>&gt;</button><button>&gt;&gt;</button></h4>
            //        <div id=""calendar-border""></div>
            //    </div>
            //";
        }


        private string GetWeek(int weekNumber, int offset, ref Dictionary<string, int> articleCounts)
        {
            StringBuilder week = new StringBuilder(700);
            week.AppendLine("<div class=\"week\">");

            for (int i = 1; i <= 7; i++) {
                int dateNumber = (i - offset) + (weekNumber * 7);
                // STOPPED HERE!
            }

            week.AppendLine("</div>");
            return week.ToString();
        }


        private string GetDay(int day, string yearMonthString, bool hasArticles)
        {
            string linkClass = hasArticles ? "link-active" : "link-inactive";
            if (day > 0) {
                return $"<a class=\"day {linkClass}\" href=\"/html/archive.html?date={yearMonthString}{Utils.Utils.GetTwoCharInt(day)}\">{day}</a>";
            }
            else {
                return "<a class=\"day\">-</a>";
            }

        }
    }
}
