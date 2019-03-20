
-- MySQL dump 10.13  Distrib 5.1.66, for redhat-linux-gnu (x86_64)
--
-- Host: mysql.eecs.oregonstate.edu    Database: CS340_Khan_Fedor
-- ------------------------------------------------------
-- Server version5.1.65-community-log
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, 
FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' 
*/;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;

CREATE TABLE airlines (
  
	IATA_code char(2) PRIMARY KEY,
  
	name varchar(50) NOT NULL UNIQUE,
  
	departure_terminal int(50) NOT NULL
);

CREATE TABLE destinations (
	id int(50) PRIMARY KEY AUTO_INCREMENT,
  
	city varchar(50) NOT NULL,
  
	country varchar(50) NOT NULL);

CREATE TABLE planes(
	id int(50) PRIMARY KEY AUTO_INCREMENT,
	airline char(2) NOT NULL,
	model varchar(50) NOT NULL,
	FOREIGN KEY (airline) REFERENCES airlines(IATA_code)
		ON DELETE CASCADE);

CREATE TABLE flights (
  
	airline_designator char(2) NOT NULL,
  
	flight_number int(50) NOT NULL,
  
	departure_time datetime(6) NOT NULL,
  
	arrival_time datetime(6) NOT NULL,
  
	destination int(50) NOT NULL,
  
	plane int(50),
	PRIMARY KEY (airline_designator, flight_number),
	FOREIGN KEY (airline_designator) REFERENCES airlines(IATA_code) ON DELETE CASCADE,
	FOREIGN KEY (destination) REFERENCES destinations(id) ON DELETE CASCADE,
	FOREIGN KEY (plane) REFERENCES planes(id) ON DELETE SET NULL
);

CREATE TABLE passengers (
  
	id int(50) PRIMARY KEY AUTO_INCREMENT,
  
	first_name varchar(50) NOT NULL,
  
	last_name varchar(50) NOT NULL,
  
	number_of_visits int(50) NOT NULL,

	airline char(2),   
	flight_number int(50),
	FOREIGN KEY (airline, flight_number) REFERENCES flights(airline_designator, flight_number) ON DELETE SET NULL
);


CREATE TABLE pilots (
  
	id int(50) PRIMARY KEY AUTO_INCREMENT,
  
	first_name varchar(50) NOT NULL,
  
	last_name varchar(50) NOT NULL,

	employer varchar(50) NOT NULL,  
	airline char(2),   
	flight_number int(50),
	FOREIGN KEY (employer) REFERENCES airlines(name) ON DELETE CASCADE,
	FOREIGN KEY (airline, flight_number) REFERENCES flights(airline_designator, flight_number) ON DELETE SET NULL
);

CREATE TABLE passenger_pilot(
	passenger int(50) NOT NULL,
	pilot int(50) NOT NULL,
	airline char(2) NOT NULL,
	flight_number int(50) NOT NULL,
	departure datetime(6) NOT NULL,
	FOREIGN KEY (passenger) REFERENCES passengers(id) ON DELETE CASCADE,
	FOREIGN KEY (pilot) REFERENCES pilots(id) ON DELETE CASCADE);


INSERT INTO destinations (city, country) VALUES ('Chicago', 'USA'), ('Seattle', 'USA'), ('New York', 'USA'), ('Beijing', 'China'), ('London', 'England');

INSERT INTO airlines (IATA_code, name, departure_terminal) VALUES ('AA', 'American Airlines', 1), ('UA', 'United Airlines', 2); 

INSERT INTO planes (airline, model) VALUES ('UA', 'Airbus A319'), ('AA', 'Airbus A300'), ('AA', 'Boeing 757'); 

INSERT INTO flights (airline_designator, flight_number, departure_time, arrival_time, destination, plane) 
	VALUES ('UA', 345, '2019-02-10 22:33:15', '2019-02-11 08:15:09', 5, 1), 
	('AA', 2055, '2019-02-11 00:24:16', '2019-02-11 06:20:54', 1, 2), 
	('AA', 155, '2019-02-11 02:13:17', '2019-02-11 07:50:43', 2, 3);

INSERT INTO passengers (first_name, last_name, number_of_visits, airline, flight_number) 
	VALUES ('Rick', 'Sanchez', 105, 'UA', 345), ('Morty', 'Smith', 1, 'UA', 345), ('Beth', 'Smith', 2, 'UA', 345), 
	('Peter', 'Griffin', 20, 'AA', 2055), ('Homer', 'Simpson', 23, 'AA', 2055), ('Phillip', 'Fry', 105, NULL, NULL); 

INSERT INTO pilots (first_name, last_name, employer, airline, flight_number)
	VALUES ('Rick', 'Sanchez', 'United Airlines', 'UA', 345), ('Glenn', 'Quagmire', 'American Airlines', 'AA', 2055), 
	('Zapp', 'Flannigan', 'American Airlines', 'AA', 155); 

 
INSERT INTO passenger_pilot (passenger, pilot, airline, flight_number, departure) SELECT PAS.id, PIL.id, 
	PAS.airline, PAS.flight_number, F.departure_time FROM passengers PAS 
	INNER JOIN pilots PIL ON PAS.airline = PIL.airline AND PAS.flight_number = PIL.flight_number
	INNER JOIN flights F ON PAS.airline = F.airline_designator AND PAS.flight_number = F.flight_number;
