using System;
using System.Diagnostics;
using System.Windows.Forms;
using System.Drawing;
using System.IO;

namespace Comptaflow_Admin_Cockpit
{
    public class Cockpit : Form
    {
        private Button btnLaunch;
        private Label lblTitle;
        private Label lblStatus;

        public Cockpit()
        {
            this.Text = "Comptaflow — Cockpit de Direction";
            this.Size = new Size(500, 350);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(10, 10, 10);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;

            lblTitle = new Label();
            lblTitle.Text = "Comptaflow ADMIN PANEL";
            lblTitle.Font = new Font("Georgia", 24, FontStyle.Italic | FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(212, 175, 55);
            lblTitle.Size = new Size(400, 50);
            lblTitle.Location = new Point(50, 40);
            lblTitle.TextAlign = ContentAlignment.MiddleCenter;

            lblStatus = new Label();
            lblStatus.Text = "Système Opérationnel • Vercel & Supabase Live";
            lblStatus.Font = new Font("Segoe UI", 8, FontStyle.Bold);
            lblStatus.ForeColor = Color.FromArgb(76, 175, 125);
            lblStatus.Size = new Size(400, 20);
            lblStatus.Location = new Point(50, 90);
            lblStatus.TextAlign = ContentAlignment.MiddleCenter;

            btnLaunch = new Button();
            btnLaunch.Text = "ENTRER DANS LE PANEL";
            btnLaunch.Size = new Size(300, 60);
            btnLaunch.Location = new Point(100, 160);
            btnLaunch.BackColor = Color.FromArgb(212, 175, 55);
            btnLaunch.ForeColor = Color.Black;
            btnLaunch.FlatStyle = FlatStyle.Flat;
            btnLaunch.Font = new Font("Segoe UI", 12, FontStyle.Bold);
            btnLaunch.Cursor = Cursors.Hand;
            btnLaunch.Click += new EventHandler(LaunchAdmin);

            this.Controls.Add(lblTitle);
            this.Controls.Add(lblStatus);
            this.Controls.Add(btnLaunch);

            Label footer = new Label();
            footer.Text = "© 2026 Comptaflow • ARCHITECTE SUPRÊME V3.0";
            footer.ForeColor = Color.FromArgb(94, 89, 79);
            footer.Font = new Font("Segoe UI", 7);
            footer.Location = new Point(0, 280);
            footer.Size = new Size(500, 20);
            footer.TextAlign = ContentAlignment.MiddleCenter;
            this.Controls.Add(footer);
        }

        private void LaunchAdmin(object sender, EventArgs e)
        {
            string url = "https://compta-flow.net/admin";
            // Launch in App Mode (Dedicated window)
            try {
                Process.Start("msedge", "--app=" + url);
            } catch {
                Process.Start(url); // Fallback
            }
            this.WindowState = FormWindowState.Minimized;
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.Run(new Cockpit());
        }
    }
}
