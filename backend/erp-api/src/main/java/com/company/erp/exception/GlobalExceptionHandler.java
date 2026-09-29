package com.company.erp.exception;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import java.time.Instant;
@RestControllerAdvice
public class GlobalExceptionHandler {
    public record ApiError(int status, String message, String path, Instant timestamp) {}
    private ResponseEntity<ApiError> error(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), message, request.getRequestURI(), Instant.now()));
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiError> missing(ResourceNotFoundException e, HttpServletRequest r) { return error(HttpStatus.NOT_FOUND, e.getMessage(), r); }
    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiError> business(BusinessException e, HttpServletRequest r) { return error(HttpStatus.CONFLICT, e.getMessage(), r); }
    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> denied(AccessDeniedException e, HttpServletRequest r) { return error(HttpStatus.FORBIDDEN, "ไม่มีสิทธิ์ดำเนินการ", r); }
    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> authentication(AuthenticationException e, HttpServletRequest r) { return error(HttpStatus.UNAUTHORIZED, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", r); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException e, HttpServletRequest r) {
        String message = e.getBindingResult().getFieldErrors().stream().map(x -> x.getField() + ": " + x.getDefaultMessage()).distinct().collect(java.util.stream.Collectors.joining(", "));
        return error(HttpStatus.BAD_REQUEST, message, r);
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException e, HttpServletRequest r) { return error(HttpStatus.BAD_REQUEST, "รูปแบบ JSON หรือชนิดข้อมูลไม่ถูกต้อง", r); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> integrity(DataIntegrityViolationException e, HttpServletRequest r) { return error(HttpStatus.CONFLICT, "ข้อมูลซ้ำหรือมีรายการอื่นอ้างอิงอยู่", r); }
    @ExceptionHandler(ConcurrencyFailureException.class)
    ResponseEntity<ApiError> concurrent(ConcurrencyFailureException e, HttpServletRequest r) { return error(HttpStatus.CONFLICT, "รายการถูกแก้ไขแล้ว กรุณาโหลดข้อมูลใหม่", r); }
}
