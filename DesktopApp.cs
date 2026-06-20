using System;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using System.IO;

namespace ComptaFlowDesktop
{
    public class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            Form form = new Form
            {
                Text = "ComptaFlow Elite - Quartier Général Financier",
                Size = new Size(1400, 900),
                StartPosition = FormStartPosition.CenterScreen,
                Icon = LoadIcon(@"C:\Users\user\CODE_WORKSPACE\Projects\flowcompta\comptaflow_final.ico")
            };

            WebBrowser webBrowser = new WebBrowser
            {
                Dock = DockStyle.Fill,
                Url = new Uri("https://compta-flow.net")
            };

            form.Controls.Add(webBrowser);
            Application.Run(form);
        }

        private static Icon LoadIcon(string path)
        {
            try { return new Icon(path); }
            catch { return null; }
        }
    }
}
