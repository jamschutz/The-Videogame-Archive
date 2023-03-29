using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebsiteBuilder.Utils
{
    static class Utils
    {
        public static string GetMonthName(int month)
        {
            switch (month)
            {
                case 1: return "January";
                case 2: return "February";
                case 3: return "March";
                case 4: return "April";
                case 5: return "May";
                case 6: return "June";
                case 7: return "July";
                case 8: return "August";
                case 9: return "September";
                case 10: return "October";
                case 11: return "November";
                case 12: return "December";
                default:
                    Console.WriteLine($"unknown month number {month}");
                    return "";
            }
        }


        public static string GetTwoCharInt(int n)
        {
            if (n < 10) {
                return $"0{n}";
            }

            return n.ToString();
        }
    }
}
