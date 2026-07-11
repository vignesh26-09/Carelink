    package com.learning.carelink.entity;

    import com.learning.carelink.enums.Role;

import jakarta.persistence.*;
    import lombok.*;

    @Entity
    @Table(name="accounts")

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Account {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(unique = true, nullable = false )
        private String email;

        @Column(name = "password_hash" , nullable = false)
        private String password;
        
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Role role;

        @Builder.Default
        private boolean active =true;

        /* 
        public void setPassword(String password){
            this.password = password;
        } */
    }
