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
    max-height: 400px;
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
            const langSelect = blockItem.querySelector('select[name$="-language"]');
            if (langSelect) langCode = langSelect.value;
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

// Drain queue
window.initCodeMirrorQueue.forEach(ta => window.initCodeMirror(ta));
window.initCodeMirrorQueue = [];

// Init existing ones (both custom admin and standard admin)
document.querySelectorAll('textarea[name$="-block"], textarea[name$="-object_declaration"], textarea[name$="-class_declaration"], textarea[name$="-input_function"], textarea[name$="-runner_code"]').forEach(textarea => {
    if (!textarea.closest('#empty-form-template') && !textarea.closest('.empty-form') && !textarea.closest('#empty-ctl-template')) {
        window.initCodeMirror(textarea);
    }
});
`;
document.head.appendChild(script);
