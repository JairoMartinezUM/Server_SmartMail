use master
go
create database SmartMailUM_DB_Prueba

--Creacion de tablas de base de datos
use SmartMailUM_DB_Prueba
go

create table Empleados(
	ID_Empleado int identity(1,1) primary key,
	Nombre varchar(100) not null,
	Apellido varchar(100) not null,
	Usuario varchar(50),
	Contraseña varchar(50),
	Tipo_Usuario varchar(20)
)

create table Paqueteria (
	ID_Paqueteria int identity(1,1) primary key,
	Paqueteria varchar(100)
)

create table Tamaño(
	ID_Tamaño int identity(1,1) primary key,
	Tamaño varchar(50)
)

create table Contenedor(
	ID_Contenedor int identity(1,1) primary key,
	Contenedor varchar(50)
)

create table status(
	ID_Status int identity(1,1) primary key,
	status varchar(50)
)

create table Fecha_Recib(
	ID_Fecha_Recib int primary key,
	Año int,
	Mes int,
	Día int
)

create table Fecha_Entrega(
	ID_Fecha_Entrega int primary key,
	Año int,
	Mes int,
	Día int
)

create table Matriculas(
	ID_Matricula_Entregado varchar(10) primary key,
	Matricula int
)

create table Info_Paquete(
	ID_Paquete int identity(1,1),
	Num_de_guia varchar(20) primary key not null,
	Destinatario varchar(50) not null,
	ID_Paqueteria int not null, --fk Paqueteria
	ID_Empleado int not null, --fk Empleados
	ID_Tamaño int, --fk Tamaño
	ID_Contenedor int, --fk Contenedor
	Remitente varchar(100),
	ID_Fecha_Recib int , --fk
	ID_Fecha_Entrega int,-- fk
	ID_Matricula_Entregado varchar(10),
	Dias_Restantes int,
	ID_Status int default 1,
	constraint FK_InfoPaquete_Paqueteria
		foreign key (ID_Paqueteria)
		references Paqueteria(ID_Paqueteria),
	constraint FK_InfoPaquete_Recibe
		foreign key (ID_Empleado)
		references Empleados(ID_Empleado),
	constraint FK_InfoPaquete_Tamaño
		foreign key (ID_Tamaño)
		references Tamaño(ID_Tamaño),
	constraint FK_InfoPaquete_Contenedor
		foreign key (ID_Contenedor)
		references Contenedor(ID_Contenedor),
	constraint FK_InfoPaquete_Status
		foreign key (ID_Status)
		references status(ID_Status),
	constraint FK_InfoPaquete_FechaRecib
		foreign key (ID_Fecha_Recib)
		references Fecha_Recib(ID_Fecha_Recib),
	constraint FK_InfoPaquete_FechaEntrega
		foreign key (ID_Fecha_Entrega)
		references Fecha_Entrega(ID_Fecha_Entrega),
	constraint FK_InfoPaquete_Matricula
		foreign key (ID_Matricula_Entregado)
		references Matriculas(ID_Matricula_Entregado)
);

--Llenado de tablas
use SmartMailUM_DB_Prueba
go

insert into Contenedor ([Contenedor])
	values('Caja'), ('Bolsa'), ('Sobre')

insert into Empleados ([Nombre], [Apellido], [Usuario], [Contraseña], Tipo_Usuario)
	values('Illia', 'Lytvynenko', 'korshyn', 'Contraseña8', 'Usuario'),
		  ('Jairo', 'Martinez', 'GabrielBess', 'EndGame', 'Administrador'),
		  ('Admin','Admin','ADMIN','ADMIN','Administrador')

insert into Paqueteria ([Paqueteria])
	values('Mercado Libre'), ('Amazon'), ('AliExpress'), ('Otros')

insert into Tamaño ([Tamaño])
	values('Pequeño'), ('Mediano'), ('Grande')

insert into status (status)
	values('En Bodega'),('Desechado'),('Entregado')


insert into Fecha_Recib (ID_Fecha_Recib, [Año], [Mes], [Día])
	values(1, year(getdate()), MONTH(getdate()), day(getdate()))

create or alter procedure [usp_Contenido_Info_Paquete]
as
begin
	select ifp.ID_Paquete, ifp.Num_de_guia, ifp.Destinatario, ifp.Remitente,ifp.ID_Paqueteria, e.Nombre as Empleado,
		   ifp.ID_Tamaño, ifp.ID_Contenedor, CONCAT(fr.Día, '-', fr.Mes, '-', fr.Año) as Fecha_Recib, 
		   CONCAT(fe.Día, ' ', fe.Mes, ' ', fe.Año)as Fecha_Entrega, m.Matricula, ifp.Dias_Restantes, s.Status
	from Info_Paquete as ifp
	inner join Empleados as e
		on ifp.ID_Empleado = e.ID_Empleado
	LEFT join Contenedor as c
		on ifp.ID_Contenedor = c.ID_Contenedor
	inner join Paqueteria as p
		on ifp.ID_Paqueteria = p.ID_Paqueteria
	LEFT join Tamaño as t
		on ifp.ID_Tamaño = t.ID_Tamaño
	inner join status as s
		on ifp.ID_status = s.ID_Status
	inner join Fecha_Recib as fr
		on fr.ID_Fecha_Recib = ifp.ID_Fecha_Recib
	LEFT join Fecha_Entrega as fe
		on fe.ID_Fecha_Entrega = ifp.ID_Fecha_Entrega
	inner join Matriculas as m
		on m.ID_Matricula_Entregado = ifp.ID_Matricula_Entregado
	order by ID_Paquete
end;

exec usp_Contenido_Info_Paquete
go

use SmartMailUM_DB_Prueba
go

create or alter trigger trg_Tiempo_Recibido
on Info_Paquete
after insert
as
begin
	declare @ID_Fecha_Recib int;
	select @ID_Fecha_Recib = ID_Fecha_Recib
	from inserted;

	if update(ID_Fecha_Recib)
	begin
		insert into Fecha_Recib(ID_Fecha_Recib, Día, Mes, Año)
			values(@ID_Fecha_Recib, DAY(GETDATE()), MONTH(Getdate()), YEAR(Getdate()))
	end
end;

create trigger trg_Tiempo_Entrega
on Info_Paquete
after insert
as
begin
	declare @ID_Fecha_Entrega int;
	select @ID_Fecha_Entrega = ID_Fecha_Entrega
	from inserted;

	if update(ID_Fecha_Entrega)
	begin
		insert into Fecha_Entrega(ID_Fecha_Entrega, Día, Mes, Año)
			values(@ID_Fecha_Entrega, DAY(GETDATE()), MONTH(Getdate()), YEAR(Getdate()))
		insert into Info_Paquete(ID_Status)
			values(3)
	end
end;

create trigger trg_Desechado
on Info_Paquete
after update
as
begin
	declare @Dias_Restantes int;
	select @Dias_Restantes = Dias_Restantes
	from inserted;
	begin
	if(@Dias_Restantes = 0)
		insert into Info_Paquete(ID_Status)
			values(2)
	end
end;

INSERT INTO Matriculas (ID_Matricula_Entregado, Matricula) 
	VALUES
('0001831273', '1240114'),
('0004647732', '1220166'),
('0007300019', '1120030'),
('0004769529', '1230538'),
('0006357911', '1180660'),
('0002888670', '1230192'),
('0001508415', '1220858');


--Login al servidor
create login SmartMail with password = 'SmarthMail';
use SmartMailUM_DB_Prueba
create user SmartMail from login SmartMail;
alter role db_owner ADD MEMBER SmartMail;
alter server role sysadmin drop member SmartMail

GRANT EXECUTE ON dbo.usp_Contenido_Info_Paquete TO SmartMail;
GO
