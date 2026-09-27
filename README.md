# CareLink

A healthcare management system designed to simplify and organize healthcare-related operations through a centralized application.

## Features

* Healthcare management
* User and data management
* Modular application structure
* Secure and organized handling of healthcare information

## Tech Stack

* **Java**
* **Spring Boot**
* **Maven**
* **Git & GitHub**

## Project Structure

```text
Carelink/
└── carelink/
    └── src/
```

## Getting Started

### Prerequisites

* Java JDK
* Maven
* Git

### Run the Project

Clone the repository:

```bash
git clone https://github.com/vignesh26-09/Carelink.git
cd Carelink
```

Build the project:

```bash
mvn clean install
```

Run the application:

```bash
mvn spring-boot:run
```

### Configuration

Do not commit credentials. The application reads database credentials and the
JWT signing key from environment variables. For local development, set
`JWT_SECRET`, `DB_USERNAME`, and `DB_PASSWORD` (and optionally `DB_URL`). The
default development connection is PostgreSQL on port 5433. Use
the `prod` profile in deployment and supply all configuration through the
deployment secret store. Sample data is disabled by default; it can only be
enabled in the `dev` profile with explicit seed-password environment variables.

## Purpose

CareLink is developed as a practical healthcare management application, focusing on building a structured and maintainable software system using Java and Spring Boot.

## License

This project is for educational and development purposes.
