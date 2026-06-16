import re
import os

def bundle():
    dist_dir = r"C:\Users\user\CODE_WORKSPACE\Projects\flowcompta\dist"
    html_path = os.path.join(dist_dir, "index.html")
    output_path = r"C:\Users\user\Desktop\Comptaflow.html"

    if not os.path.exists(html_path):
        print("❌ Dossier de build 'dist' introuvable. Veuillez d'abord compiler le projet.")
        return

    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 1. Rechercher et inclure les fichiers CSS
    css_files = [f for f in os.listdir(os.path.join(dist_dir, "assets")) if f.endswith(".css")]
    for css_file in css_files:
        css_path = os.path.join(dist_dir, "assets", css_file)
        with open(css_path, "r", encoding="utf-8") as f:
            css_content = f.read()
        
        # Remplacer la balise <link rel="stylesheet"...> par <style>...</style>
        link_pattern = re.compile(rf'<link[^>]*href=["\']/assets/{css_file}["\'][^>]*>')
        html_content = link_pattern.sub(lambda m, content=css_content: f"<style>\n{content}\n</style>", html_content)

    # 2. Rechercher et inclure les fichiers JS
    js_files = [f for f in os.listdir(os.path.join(dist_dir, "assets")) if f.endswith(".js")]
    for js_file in js_files:
        js_path = os.path.join(dist_dir, "assets", js_file)
        with open(js_path, "r", encoding="utf-8") as f:
            js_content = f.read()
        
        # Supprimer les imports et exports ES modules pour éviter les erreurs CORS de protocole local (file://)
        # Note: Dans un fichier HTML local, on utilise une exécution JS standard
        js_content = js_content.replace('type="module"', '')
        
        # Remplacer la balise <script type="module"...src="/assets/..."></script> par <script>...</script>
        script_pattern = re.compile(rf'<script[^>]*src=["\']/assets/{js_file}["\'][^>]*>\s*</script>')
        html_content = script_pattern.sub(lambda m, content=js_content: f"<script>\n{content}\n</script>", html_content)

    # Sauvegarder le fichier packagé unique sur le Bureau
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"[SUCCESS] L'application Comptaflow a ete assemblee avec succes dans : {output_path}")

if __name__ == "__main__":
    bundle()
