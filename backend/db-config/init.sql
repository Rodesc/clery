CREATE TABLE users (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    prenom VARCHAR(100),
	nom VARCHAR(100),
	email VARCHAR(255) NOT NULL UNIQUE,
	date_inscription DATE NOT NULL,
	user_type INT DEFAULT 1
);

INSERT INTO users(prenom, nom, email, date_inscription, user_type) VALUES
('admin', 'admin', 'rodolphe.deschaetzen@student.uclouvain.be', CURDATE(), 0);