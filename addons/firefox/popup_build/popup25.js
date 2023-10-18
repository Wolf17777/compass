
        function refresh_tooltips(new_tooltips) {
            new_tooltips.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        }
        refresh_tooltips([...$('[data-bs-toggle="tooltip"]')]);
    