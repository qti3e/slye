from util import run

def main(argv):
    run([third_party.ninja_path] + ninja_args,
            env=third_party.google_env(),
            quiet=True)

if __name__ == '__main__':
    sys.exit(main(sys.argv))
