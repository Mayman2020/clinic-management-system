package com.clinicmanagement.config;

import com.clinicmanagement.shared.branch.BranchContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class BranchContextFilter extends OncePerRequestFilter {
  public static final String BRANCH_HEADER = "X-Branch-Id";

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    try {
      String header = request.getHeader(BRANCH_HEADER);
      if (header != null && !header.isBlank()) {
        try {
          BranchContextHolder.set(Long.parseLong(header.trim()));
        } catch (NumberFormatException ignored) {
          // ignore invalid header
        }
      }
      chain.doFilter(request, response);
    } finally {
      BranchContextHolder.clear();
    }
  }
}
