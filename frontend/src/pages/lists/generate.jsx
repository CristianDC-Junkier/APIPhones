// mockUsers.js
export function generateMockUsers(count = 50) {
    const departments = [
        "Alcaldía", "Urbanismo", "Deportes", "Cultura", "Educación",
        "Medio Ambiente", "Informática", "Hacienda", "Personal", "Servicios Sociales"
    ];
    const subdepartments = [
        "Gestión", "Atención", "Administración", "Supervisión", "Mantenimiento"
    ];

    const users = [];

    for (let i = 0; i < count; i++) {
        const depIndex = Math.floor(Math.random() * departments.length);
        const subdepChance = Math.random() > 0.5; // 50% con subdep

        const user = {
            userData: {
                id: i + 1,
                name: `Empleado ${i + 1}`,
                email: `empleado${i + 1}@almonte.es`,
                extension: `${100 + Math.floor(Math.random() * 900)}`,
                number: `959${Math.floor(100000 + Math.random() * 899999)}`,
                departmentId: depIndex + 1,
                departmentName: departments[depIndex],
                subdepartmentId: subdepChance
                    ? Math.floor(Math.random() * subdepartments.length) + 1
                    : null,
                subdepartmentName: subdepChance
                    ? subdepartments[Math.floor(Math.random() * subdepartments.length)]
                    : null,
            },
        };

        users.push(user);
    }

    return users;
}
