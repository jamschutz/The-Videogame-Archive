namespace VideoGameArchive.Core
{
    public static class Utils
    {
        public static long GetTwoIntHash(int a, int b)
        {
            var A = (ulong)(a >= 0 ? 2 * (long)a : -2 * (long)a - 1);
            var B = (ulong)(b >= 0 ? 2 * (long)b : -2 * (long)b - 1);
            var C = (long)((A >= B ? A * A + A + B : A + B * B) / 2);
            return a < 0 && b < 0 || a >= 0 && b >= 0 ? C : -C - 1;
        }
    }
}