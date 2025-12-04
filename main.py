# main.py
import sys
import os
import time

# Add the project root to the Python path to allow imports from 'core' and 'ui'
project_root = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, project_root)

from PyQt6.QtWidgets import QApplication, QSplashScreen
from PyQt6.QtGui import QPixmap
from PyQt6.QtCore import Qt

# Now that the path is set, we can import from the ui module
from ui.main_window import MainWindow

def main() -> None:
    app = QApplication(sys.argv)

    # Load and scale tomato logo
    pixmap_path = os.path.join(project_root, "assets", "tomato_logo.png")
    pix = QPixmap(pixmap_path)
    
    if not pix.isNull():
        pix = pix.scaled(256, 256, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
        splash = QSplashScreen(pix, Qt.WindowType.WindowStaysOnTopHint)
    else:
        splash = QSplashScreen()
        splash.showMessage("Toshu is starting…", Qt.AlignmentFlag.AlignCenter, Qt.GlobalColor.white)

    splash.show()
    app.processEvents()

    # This will now load the correct main_window.py from the ui folder
    window = MainWindow()

    # A short delay so the logo is visible
    time.sleep(1.0)

    splash.finish(window)
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()