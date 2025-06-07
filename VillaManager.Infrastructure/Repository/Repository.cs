using Microsoft.EntityFrameworkCore;
using VillaManager.Infrastructure.Data;

namespace VillaManager.Infrastructure.Repository;

internal class Repository<T> : IRepository<T> where T : class
{
    private readonly ApplicationDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = _context.Set<T>();
    }

    public IQueryable<T> GetAll()
        => _dbSet;

    public IQueryable<T> GetAllReadOnly()
        => _dbSet.AsNoTracking();

    public async Task<T?> GetByIdAsync(object id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public async Task Delete(object id)
    {
        T? entity = await GetByIdAsync(id);

        if (entity != null)
        {
            _dbSet.Remove(entity);
        }
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}
