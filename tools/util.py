import os

def make_env(merge_env=None, env=None):
    if env is None:
        env = os.environ
    env = env.copy()
    if merge_env is None:
        merge_env = {}
    for key in merge_env.keys():
        env[key] = merge_env[key]
    return env

def run(args, quiet=False, cwd=None, env=None, merge_env=None):
    if merge_env is None:
        merge_env = {}
    args[0] = os.path.normpath(args[0])
    if not quiet:
        print " ".join(args)
    env = make_env(env=env, merge_env=merge_env)
    shell = os.name == "nt"  # Run through shell to make .bat/.cmd files work.
    rc = subprocess.call(args, cwd=cwd, env=env, shell=shell)
    if rc != 0:
        sys.exit(rc)
