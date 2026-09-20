USE master;
GO

ALTER DATABASE [StudentManagementDB] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

RESTORE DATABASE [StudentManagementDB]
FROM DISK = N'/var/opt/mssql/backup/StudentManagementDB.bak'
WITH REPLACE,
     MOVE N'StudentManagementDB' TO N'/var/opt/mssql/data/StudentManagementDB.mdf',
     MOVE N'StudentManagementDB_log' TO N'/var/opt/mssql/data/StudentManagementDB_log.ldf',
     RECOVERY;
GO

ALTER DATABASE [StudentManagementDB] SET MULTI_USER;
GO
