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


        public static int GetDaysInMonth(int month, int year)
        {
            switch (month) {
                case 1: return 31;
                case 2: return IsLeapYear(year)? 29 : 28;
                case 3: return 31;
                case 4: return 30;
                case 5: return 31;
                case 6: return 30;
                case 7: return 31;
                case 8: return 31;
                case 9: return 30;
                case 10: return 31;
                case 11: return 30;
                case 12: return 31;
                default:
                    Console.WriteLine($"ERROR: Unknown month: {month}");
                    return 30;
            }
        }


        public static bool IsLeapYear(int year)
        {
            // if divisible by 100, special case
            if (year % 100 == 0)
            {
                // if it's divisible by 400, it's a leap year, otherwise, it isn't
                return year % 400 == 0;
            }

            // otherwise, return if it's divisible by 4
            return year % 4 == 0;
        }
    }
}
