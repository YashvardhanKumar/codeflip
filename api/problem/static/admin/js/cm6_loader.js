const cm6Style = document.createElement('style');
cm6Style.innerHTML = `
.cm-editor {
    border: 1px solid #333;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    height: auto;
    min-height: 100px;
    background-color: #1e1e1e;
    color: #d4d4d4;
    margin-bottom: 10px;
}
.cm-scroller {
    overflow: auto;
    max-height: 250px;
}
.cm-focused {
    outline: 1px solid #3498db !important;
}
`;
document.head.appendChild(cm6Style);

// Pre-init queue before module loads
window.initCodeMirrorQueue = [];
window.initCodeMirror = function(textarea) {
    window.initCodeMirrorQueue.push(textarea);
};

const script = document.createElement('script');
script.type = 'module';
script.innerHTML = `
import {EditorView, basicSetup} from "https://esm.sh/codemirror";
import {keymap} from "https://esm.sh/@codemirror/view";
import {indentWithTab} from "https://esm.sh/@codemirror/commands";
import {indentUnit} from "https://esm.sh/@codemirror/language";
import {cpp} from "https://esm.sh/@codemirror/lang-cpp";
import {java} from "https://esm.sh/@codemirror/lang-java";
import {python} from "https://esm.sh/@codemirror/lang-python";
import {javascript} from "https://esm.sh/@codemirror/lang-javascript";
import {oneDark} from "https://esm.sh/@codemirror/theme-one-dark";

const langExtensions = {
    'CPP': cpp(),
    'JAVA': java(),
    'PYTHON': python(),
    'JAVASCRIPT': javascript(),
    'TYPESCRIPT': javascript({typescript: true})
};

window.initCodeMirror = function(textarea) {
    if (textarea._cmView) return;

    // In standard Django admin, Codeblock rows have class 'dynamic-codeblocks' or are tr elements in TabularInline
    const blockItem = textarea.closest('.codeblock-item, .dynamic-codeblocks, tr.form-row');
    let langCode = null;

    if (blockItem) {
        langCode = blockItem.getAttribute('data-lang');
        if (!langCode) {
            // Standard django admin: select element
            const langSelect = blockItem.querySelector('select[name$="language"]');
            if (langSelect) {
                langCode = langSelect.value;
                if (!langSelect._hasCmListener) {
                    langSelect._hasCmListener = true;
                    langSelect.addEventListener('change', () => {
                        // When language changes, re-initialize CodeMirror for all textareas in this block
                        blockItem.querySelectorAll('textarea').forEach(ta => {
                            if (ta._cmView) {
                                ta.value = ta._cmView.state.doc.toString();
                                ta._cmView.destroy();
                                ta._cmView = null;
                            }
                            window.initCodeMirror(ta);
                        });
                    });
                }
            }
        }
    }

    const langExt = langCode && langExtensions[langCode] ? langExtensions[langCode] : [];

    textarea.style.display = "none";

    const view = new EditorView({
        doc: textarea.value,
        extensions: [
            basicSetup,
            oneDark,
            langExt,
            keymap.of([indentWithTab]),
            indentUnit.of("    "),
            EditorView.updateListener.of((v) => {
                if (v.docChanged) {
                    textarea.value = view.state.doc.toString();
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
            })
        ],
        parent: textarea.parentNode
    });

    textarea._cmView = view;
};

// Drain queue and init existing ones
function initAll() {
    console.log("cm6_loader: initAll started. readyState:", document.readyState);
    window.initCodeMirrorQueue.forEach(ta => {
        console.log("cm6_loader: draining queue item name:", ta.name);
        window.initCodeMirror(ta);
    });
    window.initCodeMirrorQueue = [];

    const allTAs = document.querySelectorAll('textarea');
    console.log("cm6_loader: total textareas found on load:", allTAs.length);
    allTAs.forEach(textarea => {
        const name = textarea.name || '';
        const isTarget = name.endsWith('block') ||
                         name.endsWith('object_declaration') ||
                         name.endsWith('class_declaration') ||
                         name.endsWith('input_function') ||
                         name.endsWith('input_output_function') ||
                         name.endsWith('runner_code');
        const isTemplate = textarea.closest('#empty-form-template') ||
                           textarea.closest('.empty-form') ||
                           textarea.closest('#empty-ctl-template') ||
                           textarea.closest('.empty-form-row');
        console.log("cm6_loader: checking textarea:", name, "isTarget:", isTarget, "isTemplate:", !!isTemplate);
        if (isTarget && !isTemplate) {
            window.initCodeMirror(textarea);
        }
    });

    // MutationObserver to automatically initialize dynamically added textareas (Django Admin inline rows, custom wizards, etc.)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const textareas = node.querySelectorAll('textarea');
                    textareas.forEach(textarea => {
                        const name = textarea.name || '';
                        const isTarget = name.endsWith('block') ||
                                         name.endsWith('object_declaration') ||
                                         name.endsWith('class_declaration') ||
                                         name.endsWith('input_function') ||
                                         name.endsWith('input_output_function') ||
                                         name.endsWith('runner_code');
                        const isTemplate = textarea.closest('#empty-form-template') ||
                                           textarea.closest('.empty-form') ||
                                           textarea.closest('#empty-ctl-template') ||
                                           textarea.closest('.empty-form-row');
                        if (isTarget && !isTemplate) {
                            console.log("cm6_loader: MutationObserver found textarea:", name);
                            window.initCodeMirror(textarea);
                        }
                    });

                    if (node.tagName === 'TEXTAREA') {
                        const name = node.name || '';
                        const isTarget = name.endsWith('block') ||
                                         name.endsWith('object_declaration') ||
                                         name.endsWith('class_declaration') ||
                                         name.endsWith('input_function') ||
                                         name.endsWith('input_output_function') ||
                                         name.endsWith('runner_code');
                        const isTemplate = node.closest('#empty-form-template') ||
                                           node.closest('.empty-form') ||
                                           node.closest('#empty-ctl-template') ||
                                           node.closest('.empty-form-row');
                        if (isTarget && !isTemplate) {
                            console.log("cm6_loader: MutationObserver found node itself as textarea:", name);
                            window.initCodeMirror(node);
                        }
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
} else {
    initAll();
}
`;
document.head.appendChild(script);
