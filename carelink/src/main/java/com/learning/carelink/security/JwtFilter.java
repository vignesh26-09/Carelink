package com.learning.carelink.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; 

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return path.equals("/api/auth/login") || path.equals("/api/auth/register")
                || (request.getMethod().equals("GET") && (path.equals("/api/doctors")
                || path.startsWith("/api/schedule/slots/")));
    }

    @Override
    protected   void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response , @NonNull FilterChain filterChain) throws ServletException ,IOException{
         final String authHeader =request.getHeader("Authorization");
         final String jwt;
         final String userEmail;
        if(authHeader == null ||  !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request , response);
            return;
        }   
        jwt=  authHeader.substring(7);
        try {
        userEmail =jwtService.extractUsername(jwt);
        if(userEmail != null && SecurityContextHolder.getContext().getAuthentication()==null){
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            if (userDetails.isEnabled() && jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException | org.springframework.security.core.userdetails.UsernameNotFoundException ex) {
            SecurityContextHolder.clearContext();
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Your session expired. Please sign in again.\"}");
            return;
        }
        filterChain.doFilter(request,response);
    }
}
