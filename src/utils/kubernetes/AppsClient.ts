import * as k8s from '@kubernetes/client-node';

export interface ScaleBody {
  spec: k8s.V1ScaleSpec;
}

/**
 * This is a client with correct PATCH-request headers, working around the default header content types.
 * See/from https://github.com/kubernetes-client/javascript/issues/19#issuecomment-449424288
 */
export class AppsClient extends k8s.Apps_v1Api {
  public patchNamespacedDeploymentScale(name: string, ns: string, body: ScaleBody) {
    const prev = this.patchHeaders();
    const req = super.patchNamespacedDeploymentScale(name, ns, body);
    this.defaultHeaders = prev;
    return req;
  }

  public patchNamespacedStatefulSetScale(name: string, ns: string, body: ScaleBody) {
    const prev = this.patchHeaders();
    const req = super.patchNamespacedStatefulSetScale(name, ns, body);
    this.defaultHeaders = prev;
    return req;
  }

  protected patchHeaders() {
    const prev = this.defaultHeaders;
    this.defaultHeaders = {
      ...this.defaultHeaders,
      'Content-Type': 'application/strategic-merge-patch+json',
    };
    return prev;
  }
}
