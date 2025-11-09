package com.integraupt.dto;

/**
 * DTO genérico para exponer ítems de catálogos (id, nombre).
 */
public class clsDTOCatalogoItem {

    private Integer id;
    private String nombre;

    public clsDTOCatalogoItem() {
    }

    public clsDTOCatalogoItem(Integer id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
