# 🔧 Database Restore Instructies

## Clean Start Backup

Je hebt een backup gemaakt: `clean_start.sql`

## 📦 Database Herstellen

Als je database corrupt is of je wilt terug naar clean state:

```bash
# Ga naar project folder
cd /Users/dhloy/Desktop/almere-pickleball

# Herstel database
psql mydb < clean_start.sql
```

## 🔄 Database Volledig Resetten

Als je de database wilt droppen en opnieuw maken:

```bash
# Drop en maak opnieuw
psql postgres -c "DROP DATABASE IF EXISTS mydb"
psql postgres -c "CREATE DATABASE mydb"

# Herstel vanaf backup
psql mydb < clean_start.sql
```

## ✅ Verificatie

Check of het werkt:

```bash
psql mydb -c "SELECT count(*) FROM \"User\""
```

---

**💡 Tip:** Je PGUSER is ingesteld op `dhloy` in je `.zshrc`, dus je hoeft nooit meer `-U dhloy` te typen!
