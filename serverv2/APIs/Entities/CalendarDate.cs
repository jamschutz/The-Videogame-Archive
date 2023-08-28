using System;

namespace VideoGameArchive.Entities
{
    public class CalendarDate
    {
        public int year { get; set; }
        public int month { get; set; }
        public int day { get; set; }

        public CalendarDate(string date)
        {
            try {
                year = int.Parse(date.Substring(0, 4));
                month = int.Parse(date.Substring(4, 2));
                day = int.Parse(date.Substring(6));
            }
            catch(Exception ex) {
                Console.WriteLine($"error parsing date {date}: {ex.Message}");
            }
        }

        public string ToDateString()
        {
            return $"{month}/{day}/{year}";
        }

        public string ToUrlString()
        {
            return ToNumber().ToString();
        }

        public int ToNumber()
        {
            return year * 10000 + month * 100 + day;
        }

    }
}