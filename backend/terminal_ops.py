import subprocess

def run_command(cmd):
    try:
        output = subprocess.check_output(cmd, shell=True, text=True)
        return output[:500]
    except Exception as e:
        return str(e)
