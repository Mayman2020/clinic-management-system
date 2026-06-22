package com.clinicmanagement.modules.permission.annotation;
import java.lang.annotation.*;

@Target(ElementType.METHOD) @Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    String module();
    String action() default "view";
}
