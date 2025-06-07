namespace VillaManager.Infrastructure.Repository;

public interface IRepository<T> where T : class
{
    IQueryable<T> GetAll();

    IQueryable<T> GetAllReadOnly();

    Task<T?> GetByIdAsync(object id);

    Task AddAsync(T entity);

    void Update(T entity);

    Task Delete(object id);

    Task SaveAsync();
}
