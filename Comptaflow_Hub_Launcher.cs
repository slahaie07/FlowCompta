using System;
using System.Diagnostics;
using System.Windows.Forms;
using System.Drawing;
using System.IO;

namespace Comptaflow_Hub_Launcher
{
    public class HubLauncher : Form
    {
        public HubLauncher()
        {
            this.Text = "Comptaflow — Hub Écosystème";
            this.Size = new Size(400, 250);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(10, 10, 10);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;

            Label lblTitle = new Label();
            lblTitle.Text = "Comptaflow HUB";
            lblTitle.Font = new Font("Georgia", 24, FontStyle.Italic | FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(212, 175, 55);
            lblTitle.Size = new Size(300, 50);
            lblTitle.Location = new Point(50, 30);
            lblTitle.TextAlign = ContentAlignment.MiddleCenter;

            Button btnLaunch = new Button();
            btnLaunch.Text = "OUVRIR L'ÉCOSYSTÈME";
            btnLaunch.Size = new Size(250, 50);
            btnLaunch.Location = new Point(75, 100);
            btnLaunch.BackColor = Color.FromArgb(212, 175, 55);
            btnLaunch.ForeColor = Color.Black;
            btnLaunch.FlatStyle = FlatStyle.Flat;
            btnLaunch.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            btnLaunch.Cursor = Cursors.Hand;
            btnLaunch.Click += (s, e) => {
                string path = @"C:\Users\user\CODE_WORKSPACE\Projects\flowcompta\Comptaflow_HUB.html";
                if (File.Exists(path)) {
                    Process.Start(path);
                } else {
                    MessageBox.Show("Fichier Comptaflow_HUB.html introuvable.", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                Application.Exit();
            };

            this.Controls.Add(lblTitle);
            this.Controls.Add(btnLaunch);
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.Run(new HubLauncher());
        }
    }
}
