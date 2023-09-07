-- User Table:

-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	uid serial4 NOT NULL,
	"name" varchar NOT NULL,
	created_at int8 NULL,
	updated_at int8 NULL,
	status varchar NULL,
	CONSTRAINT users_pk PRIMARY KEY (uid)
);


-- Tasks Table:

-- public.tasks definition

-- Drop table

-- DROP TABLE public.tasks;

CREATE TABLE public.tasks (
	taskid serial4 NOT NULL,
	uid int4 NOT NULL,
	task_name varchar NULL,
	task_description varchar NULL,
	created_at int8 NULL,
	updated_at int8 NULL,
	status varchar NULL,
	CONSTRAINT tasks_pk PRIMARY KEY (taskid)
);


-- public.tasks foreign keys

ALTER TABLE public.tasks ADD CONSTRAINT tasks_fk FOREIGN KEY (uid) REFERENCES public.users(uid);


-- Task Tracker Table:

-- public.task_tracker definition

-- Drop table

-- DROP TABLE public.task_tracker;

CREATE TABLE public.task_tracker (
	tracker_id serial4 NOT NULL,
	taskid int4 NOT NULL,
	hours int4 NULL,
	created_at int8 NULL,
	updated_at int8 NULL,
	CONSTRAINT task_tracker_pk PRIMARY KEY (tracker_id)
);


-- public.task_tracker foreign keys

ALTER TABLE public.task_tracker ADD CONSTRAINT task_tracker_fk FOREIGN KEY (taskid) REFERENCES public.tasks(taskid);

