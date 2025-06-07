namespace VillaManager.Core.Common;
public static class Constants
{
    public static readonly IEnumerable<string> AllowedFileExtensions = 
        new HashSet<string>(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png"};
}
