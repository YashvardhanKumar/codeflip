document.addEventListener('DOMContentLoaded', function() {
    // We only want to run this inside the standard Django Admin or the Custom Admin view.
    // In Django admin, Variable inline prefix is 'variables', Codeblock prefix is 'codeblocks'

    const API_URL = '/api/rootops/generate-codeblocks-preview/';
    let updateTimeout;

    function getVariables() {
        // Collect variables from inline forms
        const variables = [];
        const varRows = document.querySelectorAll('.dynamic-variables, .variable-item, .dynamic-variables-group .inline-related:not(.empty-form)');

        varRows.forEach(row => {
            // Find inputs within this row
            const inputs = row.querySelectorAll('input, select');
            const varData = {};
            inputs.forEach(input => {
                if (input.name && input.name.includes('-')) {
                    const fieldName = input.name.split('-').pop();
                    if (input.type === 'checkbox') {
                        varData[fieldName] = input.checked;
                    } else {
                        varData[fieldName] = input.value;
                    }
                }
            });

            if (varData.name && varData.type) {
                variables.push(varData);
            }
        });

        return variables;
    }

    function getObjectDeclarations() {
        const decls = {};
        const cbRows = document.querySelectorAll('.dynamic-codeblocks, .codeblock-item, .dynamic-codeblocks-group .inline-related:not(.empty-form)');
        cbRows.forEach(row => {
            let langSelect = row.querySelector('select[name$="-language"], input[name$="-language"]');
            let objDecl = row.querySelector('textarea[name$="-object_declaration"]');
            if (langSelect && objDecl) {
                decls[langSelect.value] = objDecl.value;
            }
        });
        return decls;
    }

    function getInputFunctions() {
        const funcs = {};
        const cbRows = document.querySelectorAll('.dynamic-codeblocks, .codeblock-item, .dynamic-codeblocks-group .inline-related:not(.empty-form)');
        cbRows.forEach(row => {
            let langSelect = row.querySelector('select[name$="-language"], input[name$="-language"]');
            let inputFunc = row.querySelector('textarea[name$="-input_output_function"]');
            if (langSelect && inputFunc) {
                funcs[langSelect.value] = inputFunc.value;
            }
        });
        return funcs;
    }

    function updateCodeblocks(results) {
        // results is an object like { 'CPP': { 'block': '...', 'runner_code': '...' }, ... }

        // Find codeblock forms
        const cbRows = document.querySelectorAll('.dynamic-codeblocks, .codeblock-item:not(.variable-item), .dynamic-codeblocks-group .inline-related:not(.empty-form)');

        cbRows.forEach(row => {
            let langSelect = row.querySelector('select[name$="-language"], input[name$="-language"]');
            if (!langSelect) return;

            const lang = langSelect.value;
            if (results[lang]) {
                const blockTextarea = row.querySelector('textarea[name$="-block"]');
                const runnerTextarea = row.querySelector('textarea[name$="-runner_code"]');

                if (runnerTextarea) {
                    if (runnerTextarea._cmView) {
                        const view = runnerTextarea._cmView;
                        if (view.state.doc.toString() !== results[lang].runner_code) {
                            view.dispatch({
                                changes: {from: 0, to: view.state.doc.length, insert: results[lang].runner_code}
                            });
                        }
                    } else {
                        runnerTextarea.value = results[lang].runner_code;
                    }
                }

                if (blockTextarea) {
                    // The user is generating block via UI. Since object_declaration is now a separate field,
                    // we can safely overwrite the boilerplate to reflect the new comment blocks and variables.
                    const newVal = results[lang].block;
                    if (blockTextarea._cmView) {
                        const view = blockTextarea._cmView;
                        if (view.state.doc.toString() !== newVal) {
                            view.dispatch({
                                changes: {from: 0, to: view.state.doc.length, insert: newVal}
                            });
                        }
                    } else {
                        blockTextarea.value = newVal;
                    }
                }
            }
        });
    }

    function fetchAndApply() {
        const variables = getVariables();
        if (variables.length === 0) return;

        const objectDeclarations = getObjectDeclarations();
        const inputFunctions = getInputFunctions();

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') || ''
            },
            body: JSON.stringify({ variables: variables, object_declarations: objectDeclarations, input_output_functions: inputFunctions, input_functions: inputFunctions })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.codeblocks) {
                updateCodeblocks(data.codeblocks);
            }
        })
        .catch(err => console.error('Error generating codeblocks:', err));
    }

    function triggerUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(fetchAndApply, 500); // 500ms debounce
    }

    // Attach listeners to all variable inputs
    document.body.addEventListener('input', function(e) {
        if (e.target.matches('.dynamic-variables input, .dynamic-variables select, .variable-item input, .variable-item select, .dynamic-variables-group input, .dynamic-variables-group select, textarea[name$="-object_declaration"], textarea[name$="-input_function"], textarea[name$="-input_output_function"]')) {
            triggerUpdate();
        }
    });

    document.body.addEventListener('change', function(e) {
        if (e.target.matches('.dynamic-variables input, .dynamic-variables select, .variable-item input, .variable-item select, .dynamic-variables-group input, .dynamic-variables-group select, textarea[name$="-object_declaration"], textarea[name$="-input_function"], textarea[name$="-input_output_function"]')) {
            triggerUpdate();
        }
    });

    // Helper to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
