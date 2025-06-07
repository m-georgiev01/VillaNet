namespace VillaManager.Core.Exceptions;

public class RoleNotFoundException(int roleId) 
    : Exception($"Role with ID '{roleId}' was not found.")
{ }