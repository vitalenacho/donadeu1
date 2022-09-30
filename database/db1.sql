
CREATE DATABASE IF NOT EXISTS `Donadeu_database_v2`;
USE `Donadeu_database_v2` ;

-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`Vehiculos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`Vehiculos` (
  `idVehiculos` INT NOT NULL,
  `Nombre` VARCHAR(45) NOT NULL,
  `Patente` VARCHAR(45) NOT NULL,
  `Tipo` VARCHAR(45) NOT NULL,
  `Capacidad` INT NOT NULL,
  `Check` TINYINT(1) NOT NULL,
  PRIMARY KEY (`idVehiculos`));



-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`Direccion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`Direccion` (
  `idDireccion` INT NOT NULL,
  `Latitud` FLOAT NOT NULL,
  `Longitud` FLOAT NOT NULL,
  `Calle` VARCHAR(100) NOT NULL,
  `Ciudad` VARCHAR(45) NOT NULL,
  `Provincia` VARCHAR(45) NOT NULL,
  `Pais` VARCHAR(45) NOT NULL,
  `CodigoPostal` INT NOT NULL,
  PRIMARY KEY (`idDireccion`));



-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`Clientes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`Clientes` (
  `idCliente` INT NOT NULL,
  `Nombre` VARCHAR(45) NOT NULL,
  `IdSistemaDonadeu` INT NOT NULL,
  `Direccion_idDireccion` INT NOT NULL,
  PRIMARY KEY (`idCliente`),
  CONSTRAINT `fk_Clientes_Direccion1`
    FOREIGN KEY (`Direccion_idDireccion`)
    REFERENCES `Donadeu_database_v2`.`Direccion` (`idDireccion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`Usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`Usuarios` (
  `idUsuarios` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(45) NOT NULL,
  `Contraseña` VARCHAR(45) NOT NULL,
  `e-mail` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idUsuarios`));

ALTER TABLE `Donadeu_database_v2`.`Usuarios`
    MODIFY Contraseña VARCHAR(150) NOT NULL;



-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`Almacen`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`Almacen` (
  `idAlmacen` INT NOT NULL,
  `Direccion_idDireccion` INT NOT NULL,
  PRIMARY KEY (`idAlmacen`),
  CONSTRAINT `fk_Almacen_Direccion`
    FOREIGN KEY (`Direccion_idDireccion`)
    REFERENCES `Donadeu_database_v2`.`Direccion` (`idDireccion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`Itinerario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`Itinerario` (
  `idItinerario` INT NOT NULL,
  `dia` DATETIME(1) NULL,
  `Usuarios_idUsuarios` INT NOT NULL,
  `Vehiculos_idVehiculos` INT NOT NULL,
  `Almacen_idAlmacen` INT NOT NULL,
  `TiempoTotal` FLOAT NULL,
  `DistanciaTotal` FLOAT NULL,
  PRIMARY KEY (`idItinerario`),
  CONSTRAINT `fk_Itinerario_Usuarios1`
    FOREIGN KEY (`Usuarios_idUsuarios`)
    REFERENCES `Donadeu_database_v2`.`Usuarios` (`idUsuarios`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Itinerario_Vehiculos1`
    FOREIGN KEY (`Vehiculos_idVehiculos`)
    REFERENCES `Donadeu_database_v2`.`Vehiculos` (`idVehiculos`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Itinerario_Almacen1`
    FOREIGN KEY (`Almacen_idAlmacen`)
    REFERENCES `Donadeu_database_v2`.`Almacen` (`idAlmacen`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`DistanceClient`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`DistanceClient` (
  `idDistanceClient` INT NOT NULL,
  `TiempoViaje` FLOAT NULL,
  `DistanciaViaje` FLOAT NULL,
  `Clientes_idClientes_origen` INT NOT NULL,
  `Clientes_idClientes_destino` INT NOT NULL,
  PRIMARY KEY (`idDistanceClient`),
  CONSTRAINT `fk_DistanceClient_Clientes1`
    FOREIGN KEY (`Clientes_idClientes_origen`)
    REFERENCES `Donadeu_database_v2`.`Clientes` (`idCliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_DistanceClient_Clientes2`
    FOREIGN KEY (`Clientes_idClientes_destino`)
    REFERENCES `Donadeu_database_v2`.`Clientes` (`idCliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`DistanceBase`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`DistanceBase` (
  `idDistanceBase` INT NOT NULL,
  `DistanciaViaje` FLOAT NULL,
  `TiempoViaje` FLOAT NULL,
  `Almacen_idAlmacen` INT NOT NULL,
  `Clientes_idClientes` INT NOT NULL,
  PRIMARY KEY (`idDistanceBase`),
  CONSTRAINT `fk_DistanceBase_Almacen1`
    FOREIGN KEY (`Almacen_idAlmacen`)
    REFERENCES `Donadeu_database_v2`.`Almacen` (`idAlmacen`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_DistanceBase_Clientes1`
    FOREIGN KEY (`Clientes_idClientes`)
    REFERENCES `Donadeu_database_v2`.`Clientes` (`idCliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



-- -----------------------------------------------------
-- Table `Donadeu_database_v2`.`Secuenciamiento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Donadeu_database_v2`.`Secuenciamiento` (
  `idSecuenciamiento` INT NOT NULL,
  `Itinerario_idItinerario` INT NOT NULL,
  `DistanceClient_idDistanceClient` INT NOT NULL,
  `DistanceBase_idDistanceBase` INT NULL,
  `Orden` INT NULL,
  PRIMARY KEY (`idSecuenciamiento`),
  CONSTRAINT `fk_Secuenciamiento_Itinerario1`
    FOREIGN KEY (`Itinerario_idItinerario`)
    REFERENCES `Donadeu_database_v2`.`Itinerario` (`idItinerario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Secuenciamiento_DistanceClient1`
    FOREIGN KEY (`DistanceClient_idDistanceClient`)
    REFERENCES `Donadeu_database_v2`.`DistanceClient` (`idDistanceClient`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Secuenciamiento_DistanceBase1`
    FOREIGN KEY (`DistanceBase_idDistanceBase`)
    REFERENCES `Donadeu_database_v2`.`DistanceBase` (`idDistanceBase`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
